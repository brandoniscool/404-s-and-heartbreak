import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import Gif from './gif';
import bricks from 'bricks.js';

import './stylesheets/gifgrid.css';

const GIPHYKEY = 'ug9cmkTe3P1u6zJK22ICwjsEui0EVfWb';
const APIURLBASE = 'https://api.giphy.com/v1/gifs';

class GifGrid extends Component {
  static propTypes = {
    query: PropTypes.string,
    count: PropTypes.number.isRequired,
    rating: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      gifs: [],
    };
  }

  componentWillMount() {
    this.fixedPosition();
  }

  componentDidMount() {
    this.buildApiUrl(this.props);
  }


  componentWillReceiveProps(nextProps) {
    this.buildApiUrl(nextProps);
  }

  componentDidUpdate() {
    this.brickInit();
    if (typeof this.brickInstance !== undefined) {
      this.brickInstance.pack();
    }
  }

  buildApiUrl(props) {
    let apiUrl = APIURLBASE;
    props.query ? apiUrl += '/search?' : apiUrl += '/trending?';
    apiUrl += `limit=${props.count}&rating=${props.rating}&lang=${props.lang}`;
    // can't allow # in url params
    if (props.query) { apiUrl += `&q=${encodeURI(props.query).replace(/#/, '')}`; }
    apiUrl += `&api_key=${GIPHYKEY}`;
    this.fetchNewGifs(apiUrl);
  }

  fetchNewGifs(url) {
    fetch(url)
      .then(response => response.json())
      // remove gifs with no title - solves consistency issues
      .then(json => json.data.filter(g => g.title.length > 0))
      .then((gifs) => {
        this.setState({ gifs });
      })
      .then(() => {
        document.getElementById('gridTitle').classList.add('display');
      })
      .catch((error) => {
        console.error(error);
      }, (error) => {
        if (error) {
          console.log(error);
        }
    });

  }

  brickInit() {
    const sizes = [
      { columns: 1, gutter: 10 },
      { mq: '560px', columns: 2, gutter: 10 },
      { mq: '775px', columns: 3, gutter: 15 },
      { mq: '990px', columns: 4, gutter: 15 },
      { mq: '1205px', columns: 5, gutter: 15 },
      { mq: '1420px', columns: 6, gutter: 15 },
      { mq: '1635px', columns: 7, gutter: 15 },
      { mq: '1850px', columns: 8, gutter: 15 },
    ];

    // create a Brick instance
    this.brickInstance = bricks({
      container: '.gif-grid',
      packed: 'data-packed', // if not prefixed with 'data-', it will be added
      position: 'false',
      sizes,
    }).resize(true)
      .on('pack', () => console.log('grid items packed.'))
      .on('update', () => console.log('NEW grid items packed.'))
      .on('resize', () => console.log('The grid has be re-packed to accommodate a new BREAKPOINT.'))
      .pack();
  }

  fixedPosition() {
    const header = document.getElementById('eaze');
    const a = function addStyleOnScroll() { header.setAttribute('style','position: fixed; top: 35px;');};
    const r = function removeStyleOnScroll() {header.setAttribute('style','position: relative; top: 0px;');};
    if (header) {
      window.addEventListener('scroll', () => {
        window.pageYOffset > 130 ? a() : r();
      });
    }
  }

  render() {
    const gifs = this.state.gifs;
    return (
      <div>
        <section className='gif-grid'>
          {gifs ? (
            <Switch>
              <Route exact path='/'
                render={() => (
                  <div className='gif-grid-title' id='gridTitle'>Trending</div>
                )}
              />
              <Route path='/search/:id'
                render={() => (
                  <div className='gif-grid-title' id='gridTitle'>Results:</div>
                )}
              />
              <Route path='/g/:id'
                render={() => (
                  <div className='gif-grid-title' id='gridTitle'>Related</div>
                )}
              />
            </Switch>
          ) : (
            <span>{/* cool loader goes here */}</span>
          )}

          {gifs ? (
            gifs.map(gif =>
              // need access to query to remove from hashtag set
              <Gif key={gif.id} {...gif} {...this.props} query={this.props.query} />)
          ) : (
            <span>{/* cool loader goes here */}</span>
          )}
        </section>
      </div>
    );
  }
}

export default GifGrid;
