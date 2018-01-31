import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import keyword_extractor from 'keyword-extractor';
import ClipBoard from 'clipboard';

import GifGrid from './gifgrid';

import './stylesheets/show.css';


const GIPHYKEY = 'ug9cmkTe3P1u6zJK22ICwjsEui0EVfWb';
const APIURLBASE = 'https://api.giphy.com/v1/gifs';

import { Experiment, Variant, emitter } from 'react-ab-test';
emitter.defineVariants('Gif Show', ['hashtags', 'title']);

class Show extends Component {
  static propTypes = {
    match: PropTypes.object
  }
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      hashtags: []
    };
    this._clipboard = {};
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.buildGifUrl(this.props.match.params.id);
    this.clipboardInit();
  }

  clipboardInit() {
    this._clipboard = new ClipBoard('#eaze img');
    const self = this;
    this._clipboard.on('success', function() {
      self.clipboardToolTip();
    });
  }

  clipboardToolTip() {
    const t = document.querySelector('.copy-link');
    t.classList.add('copy-link-remove');
    setTimeout(function(){
      t.classList.remove('copy-link-remove');
    }, 2000);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ loaded: false });
    this.buildGifUrl(nextProps.match.params.id);
  }

  imageLoaded = (e) => {
    e.target.style.display = 'initial';
    this.setState({ loaded: true });
    this.setHashtags();
  }

  buildGifUrl(id) {
    if (id) {
      let api_url = APIURLBASE;
      api_url += `/${id}`;
      api_url += `?api_key=${GIPHYKEY}`;
      this.fetchSingleGif(api_url);
    }
  }

  setHashtags() {
    let g = this.state.gif;
    if (g.title) {
      g.title = g.title.replace(/gif/gi, '');
      const k = keyword_extractor.extract(g.title, {
        language: 'english',
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true
      });
      this.setState({
        hashtags: k.slice(0,5)
      });
    }
  }

  fetchSingleGif(url) {
    fetch(url)
      .then(response => response.json())
      .then((json) => {
        this.setState({ gif: json.data });
      })
      .catch((error) => {
        console.error(error);
      }, (error) => {
        if (error) {
          console.log(error);
        }
      });
  }

  render() {
    const gif = this.state.gif;
    // OPTIMIZE: Load gifs asynchronously
    return (
      <div>
        <div className='gif-center' style={gif ? { height: `${gif.images.original.height}px` } : null}>
          <div className='wrapper' id='eaze'>
            {gif ? (
              <div>
                <img
                  src={gif.images.original.url}
                  onLoad={this.imageLoaded}
                  alt={gif.title}
                  data-clipboard-text={gif ? gif.images.original.url : null}
                />
                <div className='copy-link'>GIF url copied to your clipboard!</div>
                <Experiment name='Gif Show'>
                  <Variant name='hashtags'>
                    <div className='show-hashtags'>
                      <ul>
                        {this.state.hashtags.map((h, i) => (
                          <Link key={i} to={`/search/${h}`}>
                            <li>#{h}</li>
                          </Link>
                        ))}
                      </ul>
                    </div>
                  </Variant>
                  <Variant name='title'>
                    <div className='show-title'>
                      <ul><li>
                        {this.state.hashtags.length > 0 && !!gif.source_post_url ? (
                          <a href={gif.source_post_url} rel='noopener noreferrer' target='_BLANK'>
                            <i className="fa fa-external-link" aria-hidden="true"/>{gif.title}
                          </a>
                        ) : (<span/>)}
                      </li></ul>
                    </div>
                  </Variant>
                </Experiment>
              </div>
            ) : (
              <span/>
            )}
          </div>
        </div>
        {gif ? (
          <GifGrid {...this.props} query={gif.title} />
        ) : (
          <div>
            <section className='gif-grid' />
          </div>
        )}
      </div>
    );
  }
}

export default Show;
