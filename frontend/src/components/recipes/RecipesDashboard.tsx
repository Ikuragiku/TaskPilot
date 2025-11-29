/**
 * RecipesDashboard Component
 * 
 * Main workspace for managing recipes with full CRUD operations, filtering, sorting, and categorization.
 * Integrates with the backend API while maintaining local state for offline-first UX.
 * 
 * Features:
 * - Create, read, update, delete recipes
 * - Multi-category assignment with colored badges
 * - Ingredient and recipe step management
 * - Numeric portions input
 * - Tab-based filtering by category
 * - Advanced filtering and multi-field sorting
 * - Search across recipe title, ingredients, and steps
 * - Drag-to-reorder tabs and categories
 * - Right-click delete with confirmation
 * - Optimistic updates with API sync
 * - Namespaced localStorage persistence
 * 
 * State Management:
 * - Loads data from API on mount with fallback to local storage
 * - All mutations update local state immediately for responsive UX
 * - Background API calls keep server in sync
 * - Filters, sorts, tabs, and search persist to localStorage
 * 
 * @component
 */
import React, { useEffect, useState, useRef } from 'react';
import '../../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';
import { TabsBar } from '../common/TabsBar';
import { AddTabDropdown } from '../common/AddTabDropdown';
import { FilterChips } from '../common/FilterChips';
import { FilterDropdown } from '../common/FilterDropdown';
import { SortDropdown } from '../common/SortDropdown';
import RecipesToolbar from './RecipesToolbar';
import { PALETTE } from '../../utils/constants';
import { readableTextColor, rgbaFromHex } from '../../utils/colorUtils';
import TabContextMenu from '../common/TabContextMenu';
import RecipeCategoryDropdown from './RecipeCategoryDropdown';
import RecipeIngredientDropdown from './RecipeIngredientDropdown';
import RecipeIngredientsModal from './RecipeIngredientsModal';
import { Filters } from '../../utils/taskFilters';
import * as recipeApi from '../../services/recipeService';
import {
  RECIPES_TABS_KEY,
  RECIPES_ACTIVE_TAB_KEY,
  RECIPES_SEARCH_KEY,
  RECIPES_FILTERS_KEY,
  RECIPES_SORTS_KEY,
  RECIPES_SHOW_FILTERS_KEY,
  RECIPES_SHOW_SORTS_KEY
} from '../../utils/constants';

/** Local recipe storage key for persistence */
const STORAGE_KEY = 'organize_me_recipes_v1';

/** Generate unique ID for new items */
const uid = () => Math.random().toString(36).slice(2, 9);

/** Ingredient/item type definition */
type Ingredient = { id: string; name: string };

/**
 * Local recipe type - maps API response to local state shape
 */
type LocalRecipe = {
  id: string;
  title: string;
  ingredients: Ingredient[];
  recipeItems?: Ingredient[];
  portions: number | null;
  categoryIds?: string[];
  createdAt: string;
  updatedAt?: string;
};

/**
 * RecipeItemsPreview Component
 * 
 * Helper component that displays recipe items with a clamped height.
 * Shows "View all" button when content overflows the visible area.
 * Uses ResizeObserver to detect overflow dynamically.
 * 
 * @param {Object} props - Component props
 * @param {Ingredient[]} props.items - List of recipe items to display
 * @param {string} props.id - Recipe ID for aria labels
 * @param {Function} props.onViewAll - Callback to open full modal view
 * @returns {JSX.Element} Preview with optional "View all" button
 */
const RecipeItemsPreview: React.FC<{ items: Ingredient[]; id: string; onViewAll: () => void }> = ({ items, id, onViewAll }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      // If the rendered content is taller than the clamped container, show the View all button
      setShowMore(el.scrollHeight > el.clientHeight + 1);
    };
    check();
    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(check);
      ro.observe(el);
    } catch {}
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('resize', check);
      if (ro) ro.disconnect();
    };
  }, [items]);

  return (
    <div>
      <div ref={ref} className="recipe-text-clamp">
        {items.map(it => (
          <p key={it.id}>{it.name}</p>
        ))}
      </div>
      {showMore && (
        <div style={{ marginTop: 6 }}>
          <button
            className="view-all-option"
            onClick={(e) => { e.stopPropagation(); onViewAll(); }}
            aria-label={`View all recipe items for ${id}`}
          >
            <span className="icon" aria-hidden>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="label">View all</span>
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * RecipesDashboard main component
 * Manages all recipe state, UI interactions, and API integration
 * @returns {JSX.Element} Complete recipes workspace with toolbar, table, and modals
 */
export const RecipesDashboard: React.FC = () => {
  const navigate = useNavigate();
  /** Local recipes state synced with API */
  const [recipes, setRecipes] = useState<LocalRecipe[]>(() => []);
  
  const [ingredientAnchor, setIngredientAnchor] = useState<HTMLElement | null>(null);
  const [ingredientFor, setIngredientFor] = useState<string | null>(null);
  const [ingredientsModalFor, setIngredientsModalFor] = useState<string | null>(null);
  const [ingredientsModalAnchor, setIngredientsModalAnchor] = useState<HTMLElement | null>(null);
  // Recipe items (steps/instructions) similar to ingredients
  const [recipeItemsAnchor, setRecipeItemsAnchor] = useState<HTMLElement | null>(null);
  const [recipeItemsFor, setRecipeItemsFor] = useState<string | null>(null);
  const [recipeItemsModalFor, setRecipeItemsModalFor] = useState<string | null>(null);
  const [recipeItemsModalAnchor, setRecipeItemsModalAnchor] = useState<HTMLElement | null>(null);
  const [recipeContextMenu, setRecipeContextMenu] = useState<{ x: number; y: number; recipeId: string } | null>(null);
  const CATS_KEY = 'organize_me_recipe_categories_v1';
  const [categories, setCategories] = useState<{ id: string; value: string; color: string; order: number }[]>(() => []);

  useEffect(() => {
    try { localStorage.setItem(CATS_KEY, JSON.stringify(categories)); } catch {}
  }, [categories]);

  // Load recipes and categories from API when authenticated
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await recipeApi.getRecipes();
        if (!mounted) return;
        // map API shape to local shape used by this component
        const mapped = res.map(r => ({
          id: r.id,
          title: r.title,
          ingredients: (r.items || []).map((it: any) => ({ id: it.id, name: it.name })),
          recipeItems: (r.items || []).map((it: any) => ({ id: it.id, name: it.name })),
          portions: typeof r.portions === 'number' ? r.portions : null,
          categoryIds: (r.categories || []).map((c: any) => c.id),
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })) as LocalRecipe[];
        setRecipes(mapped);

        const cats = await recipeApi.getRecipeCategories();
        if (!mounted) return;
        setCategories((cats || []).map((c: any, idx: number) => ({ id: c.id, value: c.value, color: c.color ?? PALETTE[0].color, order: typeof c.order === 'number' ? c.order : idx })));
      } catch (err) {
        // silently ignore if not authenticated or API fails; keep local state
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Toolbar / Tabs state (namespaced for Recipes)
  const [search, setSearch] = useState<string>(() => {
    try {
      return localStorage.getItem(RECIPES_SEARCH_KEY) || '';
    } catch {
      return '';
    }
  });

  const [filters, setFilters] = useState<Filters>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECIPES_FILTERS_KEY) || '{}');
      return {
        status: saved.status || [],
        project: saved.project || [],
        done: saved.done ?? null
      };
    } catch {
      return { status: [], project: [], done: null };
    }
  });

  const [sorts, setSorts] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECIPES_SORTS_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const [tabs, setTabs] = useState<string[]>(() => {
    try {
      const savedTabs = JSON.parse(localStorage.getItem(RECIPES_TABS_KEY) || '["All"]');
      const t = savedTabs.length ? savedTabs : ['All'];
      if (!t.includes('All')) t.unshift('All');
      return t;
    } catch {
      return ['All'];
    }
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    try { return localStorage.getItem(RECIPES_ACTIVE_TAB_KEY) || 'All'; } catch { return 'All'; }
  });

  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);
  const [addTabAnchor, setAddTabAnchor] = useState<HTMLElement | null>(null);
  const [tabMenu, setTabMenu] = useState<{ x: number; y: number; tab: string } | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem(RECIPES_SHOW_FILTERS_KEY) || 'false'); } catch { return false; }
  });
  const [showSorts, setShowSorts] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem(RECIPES_SHOW_SORTS_KEY) || 'false'); } catch { return false; }
  });

  useEffect(() => { localStorage.setItem(RECIPES_SEARCH_KEY, search); }, [search]);
  useEffect(() => { localStorage.setItem(RECIPES_FILTERS_KEY, JSON.stringify(filters)); }, [filters]);
  useEffect(() => { localStorage.setItem(RECIPES_SORTS_KEY, JSON.stringify(sorts)); }, [sorts]);
  useEffect(() => { localStorage.setItem(RECIPES_TABS_KEY, JSON.stringify(tabs)); }, [tabs]);
  useEffect(() => { localStorage.setItem(RECIPES_ACTIVE_TAB_KEY, activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem(RECIPES_SHOW_FILTERS_KEY, JSON.stringify(showFilters)); }, [showFilters]);
  useEffect(() => { localStorage.setItem(RECIPES_SHOW_SORTS_KEY, JSON.stringify(showSorts)); }, [showSorts]);

  const createCategory = (data: { value: string; color?: string }) => {
    // Try to create on server; fallback to local
    recipeApi.createRecipeCategory(data).then((created) => {
      setCategories(prev => [...prev, { id: created.id, value: created.value, color: created.color ?? PALETTE[0].color, order: created.order ?? prev.length }]);
    }).catch(() => {
      const id = uid();
      setCategories(prev => [...prev, { id, value: data.value, color: data.color ?? PALETTE[0].color, order: prev.length }]);
    });
  };

  const updateCategory = (id: string, data: { value?: string; order?: number; color?: string }) => {
    recipeApi.updateRecipeCategory(id, data as any).then((updated) => {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, value: updated.value, color: updated.color ?? c.color, order: updated.order ?? c.order } : c));
    }).catch(() => {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    });
  };

  const deleteCategory = (id: string) => {
    // Find value for filter cleanup
    const cat = categories.find(c => c.id === id);
    const catValue = cat?.value;
    const applyLocalRemoval = () => {
      setCategories(prev => prev.filter(c => c.id !== id));
      setRecipes(prev => prev.map(r => (r.categoryIds && r.categoryIds.includes(id) ? { ...r, categoryIds: (r.categoryIds || []).filter(x => x !== id) } : r)));
      // Also remove any active filters referencing the deleted category value
      if (catValue) {
        setFilters(f => ({ ...f, project: (f.project || []).filter(v => v !== catValue) }));
        // Remove any tabs that match deleted category value
        setTabs(t => t.filter(x => x !== catValue));
        if (activeTab === catValue) setActiveTab('All');
      }
    };
    recipeApi.deleteRecipeCategory(id).then(applyLocalRemoval).catch(applyLocalRemoval);
  };

  const [categoryAnchor, setCategoryAnchor] = useState<HTMLElement | null>(null);
  const [categoryFor, setCategoryFor] = useState<string | null>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes)); } catch {}
  }, [recipes]);

  /**
   * Creates a new recipe with inherited filters/tab context
   * Attempts API creation first, falls back to local-only on failure
   * New recipes inherit active tab and category filters for immediate visibility
   */
  const createRecipe = () => {
    // Create on server if possible, otherwise fallback to local
    // Inherit active filters/tab so the new recipe appears in current view
    const selectedCategoryIds = (() => {
      const fromTab = activeTab !== 'All' ? categories.filter(c => c.value === activeTab).map(c => c.id) : [];
      const fromFilters = (filters.project || []).map(val => categories.find(c => c.value === val)?.id).filter(Boolean) as string[];
      return Array.from(new Set([ ...fromTab, ...fromFilters ]));
    })();
    const payload = { title: 'New Recipe', portions: 2, categoryIds: selectedCategoryIds.length ? selectedCategoryIds : undefined } as any;
    recipeApi.createRecipe(payload).then((created) => {
      const mapped: LocalRecipe = {
        id: created.id,
        title: created.title,
        ingredients: (created.items || []).map((it: any) => ({ id: it.id, name: it.name })),
        recipeItems: (created.items || []).map((it: any) => ({ id: it.id, name: it.name })),
        portions: typeof created.portions === 'number' ? created.portions : null,
        categoryIds: (created.categories || []).map((c: any) => c.id),
        createdAt: created.createdAt,
      };
      setRecipes(prev => [mapped, ...prev]);
    }).catch(() => {
      const r: LocalRecipe = {
        id: uid(),
        title: 'New Recipe',
        ingredients: [],
        recipeItems: [],
        portions: 2,
        categoryIds: selectedCategoryIds,
        createdAt: new Date().toISOString(),
      };
      setRecipes(prev => [r, ...prev]);
    });
  };

  /**
   * Updates a recipe with optimistic local update and background API sync
   * @param {string} id - Recipe ID to update
   * @param {Partial<LocalRecipe>} patch - Fields to update
   */
  const updateRecipe = (id: string, patch: Partial<LocalRecipe>) => {
    // Optimistically update local state
    setRecipes(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
    // Send update to server in background
    (async () => {
      try {
        const payload: any = {};
        if (patch.title !== undefined) payload.title = patch.title;
        if ((patch as any).description !== undefined) payload.description = (patch as any).description;
        if (patch.portions !== undefined) payload.portions = patch.portions;
        if ((patch as any).recipeItems !== undefined) payload.itemNames = ((patch as any).recipeItems || []).map((it: any) => it.name);
        if ((patch as any).categoryIds !== undefined) payload.categoryIds = (patch as any).categoryIds;
        await recipeApi.updateRecipe(id, payload);
      } catch (err) {
        // ignore errors for now; UI remains optimistic
      }
    })();
  };

  /**
   * Deletes a recipe with optimistic removal and background API call
   * @param {string} id - Recipe ID to delete
   */
  const deleteRecipe = (id: string) => {
    // Optimistic
    setRecipes(prev => prev.filter(r => r.id !== id));
    recipeApi.deleteRecipe(id).catch(() => {
      // If delete fails, we can't recover easily — user can refresh
    });
  };

  

  return (
    <div>
      <header className="app-header">
        <div className="logout-wrap">
          <button className="btn small hub-btn" onClick={() => navigate('/')} title="Go to Hub" style={{ marginRight: '0.5rem' }}>
            Hub
          </button>
          <button className="btn small logout-btn" onClick={() => { /* no-op for local-only dashboard */ }}>
            Logout
          </button>
        </div>
      </header>

      <main className="container">
        <section className="card">
          <div className="tabs-toolbar-row">
            <TabsBar
              tabs={tabs}
              activeTab={activeTab}
              onTabClick={setActiveTab}
              onTabContextMenu={(x, y, tab) => { setTabMenu({ x, y, tab }); }}
              onAddTabClick={(el) => { setAddTabAnchor(el); setFilterAnchor(null); setSortAnchor(null); }}
              onReorder={(newTabs) => setTabs(newTabs)}
            />
            <RecipesToolbar
              onAddRecipe={async () => {
                try {
                  createRecipe();
                } catch (err) { console.error(err); }
              }}
              // Toggle the chips/filters area only. Opening the actual filter dropdown should happen
              // when the user clicks the "Add filter" control inside the chips area.
              onFilterClick={() => { setFilterAnchor(null); setSortAnchor(null); setAddTabAnchor(null); setShowFilters(prev => !prev); }}
              onSortClick={() => { setSortAnchor(null); setFilterAnchor(null); setAddTabAnchor(null); setShowSorts(prev => !prev); }}
              searchValue={search}
              onSearchChange={setSearch}
              // Only treat project/category filters as active for Recipes
              hasActiveFilters={filters.project.length > 0}
              hasActiveSorts={sorts.length > 0}
              isFilterOpen={showFilters}
              isSortOpen={showSorts}
            />
          </div>

          {(showFilters || showSorts) && (
            <FilterChips
              filters={filters}
              sorts={sorts}
              statusOptions={[]}
              projectOptions={categories}
              onRemoveStatusFilter={(s: string) => setFilters(f => ({ ...f, status: f.status.filter(x => x !== s) }))}
              onRemoveProjectFilter={(p: string) => setFilters(f => ({ ...f, project: f.project.filter(x => x !== p) }))}
              onRemoveDoneFilter={() => setFilters(f => ({ ...f, done: null }))}
              onRemoveSort={(i: number) => setSorts(old => old.filter((_, idx) => idx !== i))}
              onClearFilters={() => setFilters({ status: [], project: [], done: null })}
              onClearSorts={() => setSorts([])}
              onAddFilterClick={(el: HTMLElement) => setFilterAnchor(el)}
              onAddSortClick={(el: HTMLElement) => setSortAnchor(el)}
              showFilters={showFilters}
              showSorts={showSorts}
            />
          )}

          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="tasks-table">
              <thead>
                <tr>
                  {(() => {
                    // Build header cells with clickable sorting similar to TaskTableHeader
                    const cols = [
                      { key: 'name', label: 'Name', field: 'name' },
                      { key: 'ingredients', label: 'Ingredients', field: null },
                      { key: 'recipe', label: 'Recipe', field: 'recipe' },
                      { key: 'portions', label: 'Portions', field: 'portions' },
                      { key: 'category', label: 'Category', field: 'category' }
                    ];
                    return cols.map(col => {
                      const field = col.field;
                      const sIdx = field ? sorts.findIndex(s => s.field === field) : -1;
                      const showSort = sIdx >= 0;
                      return (
                        <th
                          key={col.key}
                          className={col.key === 'portions' ? 'col-portions' : ''}
                          onClick={(e) => {
                            if (!field) return; // non-sortable
                            const shift = (e as React.MouseEvent).shiftKey;
                            setSorts(prev => {
                              const existingIdx = prev.findIndex(s => s.field === field);
                              if (!shift) {
                                if (existingIdx === -1) return [{ field, asc: true }];
                                if (prev[existingIdx].asc) return [{ field, asc: false }];
                                return [];
                              } else {
                                if (existingIdx === -1) return [...prev, { field, asc: true }];
                                return prev.map((s, i) => i === existingIdx ? { ...s, asc: !s.asc } : s);
                              }
                            });
                          }}
                        >
                          {col.label}
                          {showSort && (
                            <span className="sort-ind">
                              {sorts[sIdx].asc ? '↑' : '↓'}
                              <span className="idx">{sIdx + 1}</span>
                            </span>
                          )}
                        </th>
                      );
                    });
                  })()}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Apply simple filtering: active tab and project filters and search
                  const filtered = (recipes || []).filter((r) => {
                    if (activeTab && activeTab !== 'All') {
                      const cat = categories.find(c => c.value === activeTab);
                      if (!cat) return false;
                      if (!r.categoryIds || !r.categoryIds.includes(cat.id)) return false;
                    }

                    if (filters.project && filters.project.length > 0) {
                      const ids = categories.filter(c => filters.project.includes(c.value)).map(c => c.id);
                      if (!r.categoryIds || !r.categoryIds.some(id => ids.includes(id))) return false;
                    }

                    if (search && search.trim()) {
                      const s = search.toLowerCase();
                      const inTitle = (r.title || '').toLowerCase().includes(s);
                      const inIngredients = (r.ingredients || []).some(i => (i.name || '').toLowerCase().includes(s));
                      const inRecipe = (r.recipeItems || []).some(i => (i.name || '').toLowerCase().includes(s));
                      if (!inTitle && !inIngredients && !inRecipe) return false;
                    }

                    return true;
                  });

                  // Apply recipe-specific sorting if requested
                  const sorted = ((): typeof filtered => {
                    if (!sorts || sorts.length === 0) return filtered;
                    const copy = [...filtered];
                    copy.sort((a, b) => {
                      for (const s of sorts) {
                        const field = s.field;
                        const asc = s.asc;

                        if (field === 'name') {
                          const aVal = (a.title || '').toLowerCase();
                          const bVal = (b.title || '').toLowerCase();
                          const cmp = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
                          if (cmp !== 0) return asc ? cmp : -cmp;
                          continue;
                        }

                        if (field === 'portions') {
                          const aNum = typeof a.portions === 'number' ? a.portions : 0;
                          const bNum = typeof b.portions === 'number' ? b.portions : 0;
                          if (aNum !== bNum) return asc ? (aNum - bNum) : (bNum - aNum);
                          continue;
                        }

                        if (field === 'category') {
                          const aNames = (a.categoryIds || []).map(id => categories.find(c => c.id === id)?.value || '').join(',').toLowerCase();
                          const bNames = (b.categoryIds || []).map(id => categories.find(c => c.id === id)?.value || '').join(',').toLowerCase();
                          const cmp = aNames.localeCompare(bNames, undefined, { numeric: true, sensitivity: 'base' });
                          if (cmp !== 0) return asc ? cmp : -cmp;
                          continue;
                        }

                        // Fallback: compare stringified field
                        const aVal = String((a as any)[field] ?? '').toLowerCase();
                        const bVal = String((b as any)[field] ?? '').toLowerCase();
                        const cmp = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
                        if (cmp !== 0) return asc ? cmp : -cmp;
                      }
                      return 0;
                    });
                    return copy;
                  })();

                  if (sorted.length === 0) return (
                    <tr>
                      <td colSpan={5} className="muted">No recipes yet</td>
                    </tr>
                  );

                  return sorted.map(r => (
                    <tr
                      key={r.id}
                      onMouseDown={(e) => {
                        // Prevent right-click from focusing inputs before contextmenu fires
                        if ((e as React.MouseEvent).button === 2) {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                      onContextMenu={(e) => {
                        // prevent text caret focusing and stop the click from activating inputs
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          const active = document.activeElement as HTMLElement | null;
                          if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
                            active.blur();
                          }
                          // also blur any inputs inside this row to avoid caret/cursor changes
                          const row = e.currentTarget as HTMLElement;
                          row.querySelectorAll('input, textarea').forEach((el) => (el as HTMLElement).blur());
                        } catch {}
                        setRecipeContextMenu({ x: e.clientX + window.scrollX, y: e.clientY + window.scrollY, recipeId: r.id });
                      }}
                    >
                      <td data-field="title">
                        <input
                          type="text"
                          value={r.title}
                          onChange={(e) => updateRecipe(r.id, { title: e.target.value })}
                          style={{ width: '100%', background: 'transparent', border: '0', color: 'var(--text)' }}
                        />
                      </td>
                      <td
                        data-field="ingredients"
                        tabIndex={0}
                        onClick={(e) => {
                          const td = e.currentTarget as HTMLElement;
                          setIngredientAnchor(td);
                          setIngredientFor(r.id);
                          td.focus();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const td = e.currentTarget as HTMLElement;
                            setIngredientAnchor(td);
                            setIngredientFor(r.id);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="ingredients-preview" id={`ingredients-${r.id}`} style={{ width: '100%', textAlign: 'left', position: 'relative' }}>
                          {r.ingredients && r.ingredients.length > 0 && (
                            <div>
                              <ul style={{ margin: 0, paddingLeft: 16 }}>
                                {r.ingredients.slice(0, 5).map(i => (
                                  <li key={i.id} style={{ marginBottom: 6 }}>
                                    <span className="muted">{i.name}</span>
                                  </li>
                                ))}
                              </ul>
                              {r.ingredients.length > 5 && (
                                <div style={{ marginTop: 6 }}>
                                  <button
                                    className="view-all-option"
                                    onClick={(e) => { e.stopPropagation(); setIngredientsModalFor(r.id); setIngredientsModalAnchor(null); }}
                                    aria-label={`View all ingredients for ${r.title}`}
                                  >
                                    <span className="icon" aria-hidden>
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </span>
                                    <span className="label">View all</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          {(!r.ingredients || r.ingredients.length === 0) && (
                            <span className="muted">No ingredients</span>
                          )}
                          {/* removed duplicate top-right "View all" button - inline option used instead */}
                        </div>
                      </td>
                      <td
                        data-field="recipe"
                        tabIndex={0}
                        onClick={(e) => {
                          const td = e.currentTarget as HTMLElement;
                          setRecipeItemsAnchor(td);
                          setRecipeItemsFor(r.id);
                          td.focus();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const td = e.currentTarget as HTMLElement;
                            setRecipeItemsAnchor(td);
                            setRecipeItemsFor(r.id);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="ingredients-preview" id={`recipeitems-${r.id}`} style={{ width: '100%', textAlign: 'left', position: 'relative' }}>
                          <RecipeItemsPreview
                            items={r.recipeItems ?? []}
                            id={r.id}
                            onViewAll={() => { setRecipeItemsModalFor(r.id); setRecipeItemsModalAnchor(null); }}
                          />
                        </div>
                      </td>
                      <td data-field="portions">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="\d*"
                          value={r.portions === null || r.portions === undefined ? '' : String(r.portions)}
                          onChange={(e) => {
                            // keep only digits; allow empty string to represent no value
                            const digits = (e.target.value || '').replace(/\D/g, '');
                            if (digits === '') {
                              updateRecipe(r.id, { portions: null });
                              return;
                            }
                            const parsed = Math.max(1, parseInt(digits, 10));
                            updateRecipe(r.id, { portions: parsed });
                          }}
                          onKeyDown={(e) => {
                            // allow navigation/control keys; otherwise only digits
                            const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                            if (allowed.includes(e.key)) return;
                            if (!/^[0-9]$/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const text = (e.clipboardData?.getData('text') || '').replace(/\D/g, '');
                            if (text === '') {
                              updateRecipe(r.id, { portions: null });
                              return;
                            }
                            const parsed = Math.max(1, parseInt(text, 10));
                            updateRecipe(r.id, { portions: parsed });
                          }}
                          onBlur={(e) => {
                            // normalize but allow empty value to remain null
                            const digits = (e.target as HTMLInputElement).value.replace(/\D/g, '');
                            if (digits === '') {
                              if (r.portions !== null) updateRecipe(r.id, { portions: null });
                              return;
                            }
                            const parsed = Math.max(1, parseInt(digits, 10));
                            if (parsed !== r.portions) updateRecipe(r.id, { portions: parsed });
                          }}
                          style={{ width: 80, background: 'transparent', border: 0, color: 'var(--text)' }}
                        />
                      </td>
                      <td
                        data-field="category"
                        tabIndex={0}
                        onClick={(e) => {
                          const td = e.currentTarget as HTMLElement;
                          setCategoryAnchor(td);
                          setCategoryFor(r.id);
                          // focus the td to trigger the full-cell highlight
                          td.focus();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const td = e.currentTarget as HTMLElement;
                            setCategoryAnchor(td);
                            setCategoryFor(r.id);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 8, alignItems: 'center' }}>
                          {r.categoryIds && r.categoryIds.length > 0 ? (
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                              {r.categoryIds.map(cid => {
                                const c = categories.find(cat => cat.id === cid);
                                if (!c) return null;
                                return (
                                  <span
                                    key={cid}
                                    className="badge"
                                    style={{
                                      background: rgbaFromHex(c.color, 0.2),
                                      borderColor: rgbaFromHex(c.color, 0.45),
                                      color: readableTextColor(c.color)
                                    }}
                                  >
                                    {c.value}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="muted">Select…</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          {recipeContextMenu && (
            <TabContextMenu
              x={recipeContextMenu.x}
              y={recipeContextMenu.y}
              tab="Delete Recipe"
              onDelete={() => {
                deleteRecipe(recipeContextMenu.recipeId);
                setRecipeContextMenu(null);
              }}
              onClose={() => setRecipeContextMenu(null)}
            />
          )}
          {addTabAnchor && (
            <AddTabDropdown
              anchorEl={addTabAnchor}
              projectOptions={categories.map(c => ({ id: c.id, value: c.value, color: c.color, createdAt: '', order: c.order }))}
              tabs={tabs}
              setTabs={setTabs}
              setActiveTab={setActiveTab}
              createProject={(data) => Promise.resolve(createCategory(data)).then(() => undefined)}
              onClose={() => setAddTabAnchor(null)}
            />
          )}
          {tabMenu && (
            <TabContextMenu
              x={tabMenu.x}
              y={tabMenu.y}
              tab={tabMenu.tab}
              onDelete={() => {
                setTabs(t => t.filter(x => x !== tabMenu.tab));
                if (activeTab === tabMenu.tab) setActiveTab('All');
                setTabMenu(null);
              }}
              onClose={() => setTabMenu(null)}
            />
          )}
          {filterAnchor && (
            <FilterDropdown
              anchorEl={filterAnchor}
              statusOptions={[]}
              projectOptions={categories.map(c => ({ id: c.id, value: c.value, color: c.color, createdAt: '', order: c.order }))}
              showStatus={false}
              showProject={true}
              showDone={false}
              projectLabel={'Kategorie'}
              filters={filters}
              setFilters={setFilters}
              onClose={() => setFilterAnchor(null)}
            />
          )}
          {sortAnchor && (
            <SortDropdown
              anchorEl={sortAnchor}
              sorts={sorts}
              setSorts={setSorts}
              fields={[ 'name', 'recipe', 'portions', 'category' ]}
              onClose={() => setSortAnchor(null)}
            />
          )}
          {categoryFor && categoryAnchor && (
            <RecipeCategoryDropdown
              anchorEl={categoryAnchor}
              recipeId={categoryFor}
              options={categories}
              currentCategoryIds={(() => recipes.find(rr => rr.id === categoryFor)?.categoryIds ?? [])()}
              onClose={() => { setCategoryAnchor(null); setCategoryFor(null); }}
              updateRecipe={updateRecipe}
              createCategory={(data) => createCategory(data)}
              updateCategory={(id, data) => updateCategory(id, data)}
              deleteCategory={(id) => deleteCategory(id)}
              onOptionDeleted={(opt) => {
                // ensure recipes referencing deleted option are cleared
                setRecipes(prev => prev.map(r => (r.categoryIds && r.categoryIds.includes(opt.id) ? { ...r, categoryIds: (r.categoryIds || []).filter(x => x !== opt.id) } : r)));
              }}
            />
          )}
          {ingredientFor && ingredientAnchor && (
            <RecipeIngredientDropdown
              anchorEl={ingredientAnchor}
              recipeId={ingredientFor}
              items={(() => recipes.find(rr => rr.id === ingredientFor)?.ingredients ?? [])()}
              onClose={() => { setIngredientAnchor(null); setIngredientFor(null); }}
              updateRecipe={updateRecipe}
            />
          )}
          {recipeItemsFor && recipeItemsAnchor && (
            <RecipeIngredientDropdown
              anchorEl={recipeItemsAnchor}
              recipeId={recipeItemsFor}
              items={(() => recipes.find(rr => rr.id === recipeItemsFor)?.recipeItems ?? [])()}
              onClose={() => { setRecipeItemsAnchor(null); setRecipeItemsFor(null); }}
              updateRecipe={updateRecipe}
              label="Recipe"
              fieldKey="recipeItems"
            />
          )}
          {ingredientsModalFor && (
            <RecipeIngredientsModal
              recipeId={ingredientsModalFor}
              items={(() => recipes.find(rr => rr.id === ingredientsModalFor)?.ingredients ?? [])()}
              onClose={() => setIngredientsModalFor(null)}
              onEdit={(id) => {
                // close modal and open ingredient editor anchored to the cell
                setIngredientsModalFor(null);
                const td = document.getElementById(`ingredients-${id}`) as HTMLElement | null;
                if (td) {
                  setIngredientAnchor(td);
                  setIngredientFor(id);
                  td.focus();
                }
              }}
              anchorEl={ingredientsModalAnchor}
            />
          )}
          {recipeItemsModalFor && (
            <RecipeIngredientsModal
              recipeId={recipeItemsModalFor}
              items={(() => recipes.find(rr => rr.id === recipeItemsModalFor)?.recipeItems ?? [])()}
              onClose={() => setRecipeItemsModalFor(null)}
              onEdit={(id) => {
                // close modal and open recipe items editor anchored to the cell
                setRecipeItemsModalFor(null);
                const td = document.getElementById(`recipeitems-${id}`) as HTMLElement | null;
                if (td) {
                  setRecipeItemsAnchor(td);
                  setRecipeItemsFor(id);
                  td.focus();
                }
              }}
              anchorEl={recipeItemsModalAnchor}
              label="Recipe"
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default RecipesDashboard;
