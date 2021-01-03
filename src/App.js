import React from 'react';
import { HashRouter as Router, Route, Link } from 'react-router-dom';


const routes = [
  { path: "/", component: Home },
  { path: "/hello", component: Hello },
];


function Hello() {
  return <div>Hello, world!</div>;
}


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
