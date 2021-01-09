import React from 'react';
import { HashRouter as Router, Route, Link } from 'react-router-dom';
import Map from './views/Map';


const routes = [
  { path: "/", component: Home },
  { path: "/map", component: Map },
];


function Home() {
  return (
    <ul>
      {routes.map((r, i) => (
        <li key={i}>
          <Link to={r.path}>{r.component.name}</Link>
        </li>
      ))}
    </ul>
  );
}


export default function AppRouter() {
  return (
    <Router>
      {routes.map((r, i) => (
        <Route path={r.path} exact component={r.component} key={i} />
      ))}
    </Router>
  );
}
