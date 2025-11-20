import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useLocation } from 'react-router-dom';

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
