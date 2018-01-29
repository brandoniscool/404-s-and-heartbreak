import React, { Component } from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import { PropsRoute } from 'react-router-with-props';

import GifGrid from './gifgrid';
import Show from './show';

import './stylesheets/app.css';

// react-ab-testing
import { Experiment, Variant, emitter } from 'react-ab-test';
import experimentDebugger from 'react-ab-test/lib/debugger';
// enable ab test debugger
experimentDebugger.enable();
emitter.defineVariants('Gif Count', ['Count 65', 'Count 40'], [50,50]);
// // Called when the experiment is displayed to the user.
emitter.addPlayListener(function(experimentName, variantName){
  console.log('%c Displaying experiment ‘' + experimentName + '’ variant ‘' + variantName + '’', 'color: red');
});

class App extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object
  }
  constructor(props){
    super(props);
    this.state = {
      count: 40,
      rating: 'R',
      lang: 'en',
      search_value: '',
      query: this.props.match.params.query || this.props.match.params.slug
    };
  }

  componentWillReceiveProps(nextProps) {
    const new_query = nextProps.match.params.query;
    if (new_query !== this.state.query) {
      this.setState(function(){
        return {
          query: new_query
        };
      });
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  handleChange = (e) => {
    this.setState({search_value: e.target.value});
  }
  handleSubmit = (e) => {
    const val = this.state;
    e.preventDefault();
    if (val.search_value.length > 0) {
      this.props.history.push(`/search/${val.search_value}`);
      document.getElementById('search').value = '';
      //location.href = `/search/${val}`;
    }
  }

  render() {
    return (
      <div>
        <div className='flex-grid search' >
          <Switch>
            <Route path={'/search/:id'} render={() => (
              <Link to={'/'} title='Trending'>
                <i className={`fa fa-newspaper-o`} aria-hidden='true'></i>
              </Link>
            )} />
            <Route path={'/g/:id'} render={() => (
              <Link to={'/'} title='Back to Home'>
                <i className={`fa fa-chevron-left`} aria-hidden='true'></i>
              </Link>
            )} />
          </Switch>
          <form className='col' value={this.state.value} onSubmit={this.handleSubmit} onChange={this.handleChange}>
            <input type='search' placeholder={this.state.query || 'search gifs'} id='search' tabIndex='0' name='q' autoFocus />
          </form>
        </div>
        <Experiment name='Gif Count'>
          <Variant name='Count 65'>
            <PropsRoute exact path='/' component={GifGrid} {...this.state} count={65}/>
            <PropsRoute path='/search/:query' component={GifGrid} {...this.state} count={65}/>
            <PropsRoute path='/g/:id' component={Show} {...this.state} count={65}/>
          </Variant>
          <Variant name='Count 40'>
            <PropsRoute exact path='/' component={GifGrid} {...this.state}/>
            <PropsRoute path='/search/:query' component={GifGrid} {...this.state}/>
            <PropsRoute path='/g/:id' component={Show} {...this.state}/>
          </Variant>
        </Experiment>
      </div>
    );
  }
}

export default App;
