import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Switch } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';
const customHistory = createBrowserHistory();

import App from './app';

import './stylesheets/index.css';
import giphy from './PoweredBy_200px-White_HorizText.png';

function Index() {
  return (
    <div>
      <div className='container'>
        <Switch>
          <Route exact path='/search/:query' component={App} />
          <Route exact path='/g/:id' component={App} />
          <Route path='/' component={App} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

const Footer = () => (
  <footer>
    <img className='kanye' height='100px' onClick={() => window.scrollTo({'behavior': 'smooth','left': 'left', 'top': 'top'})} src='https://media.giphy.com/media/fDIFbZPsI38yY/giphy.gif' alt='808s heartbreaks' />
    <a href='https://www.giphy.com' rel='noopener noreferrer' target='_BLANK'>
      <img src={giphy} height='12px' alt='powered by giphy' />
    </a>
  </footer>
);

ReactDOM.render(
  <Router history={customHistory}>
    <Route path='/' component={Index} />
  </Router>,
  document.getElementById('root')
);
