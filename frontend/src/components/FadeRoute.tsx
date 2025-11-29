/**
 * FadeRoute Component
 * 
 * Provides smooth fade transitions between routes using react-transition-group.
 * Wraps route content in a CSSTransition that animates on route changes.
 * 
 * The transition is keyed by location.pathname, so each route change triggers
 * a new animation cycle with unmountOnExit to clean up the old route.
 * 
 * @component
 * @example
 * <FadeRoute>
 *   <Routes>
 *     <Route path="/" element={<Home />} />
 *   </Routes>
 * </FadeRoute>
 */
import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useLocation } from 'react-router-dom';

/**
 * FadeRoute component that wraps children with fade transition effects
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Route content to wrap with fade transition
 * @returns {JSX.Element} Transition-wrapped content
 */
const FadeRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <TransitionGroup component={null}>
      <CSSTransition
        key={location.pathname}
        classNames="fade-route"
        timeout={300}
        unmountOnExit
      >
        <div>{children}</div>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default FadeRoute;
