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
    match: PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      hashtags: [],
    };
    this.clipboard = {};
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.buildGifUrl(this.props.match.params.id);
    this.clipboardInit();
  }

  componentWillReceiveProps(nextProps) {
    this.buildGifUrl(nextProps.match.params.id);
  }

  setHashtags() {
    const g = this.state.gif;
    if (g.title) {
      g.title = g.title.replace(/gif/gi, '');
      const k = keyword_extractor.extract(g.title, {
        language: 'english',
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true,
      });
      this.setState({
        hashtags: k.slice(0, 5),
      });
    }
  }

  buildGifUrl(id) {
    if (id) {
      let apiUrl = APIURLBASE;
      apiUrl += `/${id}`;
      apiUrl += `?api_key=${GIPHYKEY}`;
      this.fetchSingleGif(apiUrl);
    }
  }

  imageLoaded = (e) => {
    e.target.style.display = 'initial';
    this.setHashtags();
  }

  clipboardToolTip() {
    const t = this.refCopyAlert;
    t.classList.add('copy-link-remove');
    setTimeout(() => {
      t.classList.remove('copy-link-remove');
    }, 2000);
  }

  clipboardInit() {
    this.clipboard = new ClipBoard('#eaze img');
    const self = this;
    this.clipboard.on('success', () => {
      self.clipboardToolTip();
    });
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
    return (
      <div>
        <div className="gif-center" style={gif ? { height: `${gif.images.original.height}px` } : null}>
          <div className="wrapper" id="eaze">
            {gif ? (
              <div>
                <img
                  src={gif.images.original.url}
                  onLoad={this.imageLoaded}
                  alt={gif.title}
                  data-clipboard-text={gif ? gif.images.original.url : null}
                />
                <div className="copy-link" ref={(div) => { this.refCopyAlert = div; }}>GIF url copied to your clipboard!</div>
                <Experiment name="Gif Show">
                  <Variant name="hashtags">
                    <div className="show-hashtags">
                      <ul>
                        {this.state.hashtags.map((h, i) => (
                          <Link key={i} to={`/search/${h}`}>
                            <li>#{h}</li>
                          </Link>
                        ))}
                      </ul>
                    </div>
                  </Variant>
                  <Variant name="title">
                    <div className="show-title">
                      <ul><li>
                        {this.state.hashtags.length > 0 ? (
                          <a href={gif.source_post_url || `https://giphy.com/search/${encodeURI(gif.title)}`} rel="noopener noreferrer" target="_BLANK">
                            <i className="fa fa-external-link" aria-hidden="true" />{gif.title}
                          </a>
                        ) : (<span />)}
                      </li>
                      </ul>
                    </div>
                  </Variant>
                </Experiment>
              </div>
            ) : (
              <span />
            )}
          </div>
        </div>
        {gif ? (
          <GifGrid {...this.props} query={gif.title} />
        ) : (
          <div>
            <section className="gif-grid" />
          </div>
        )}
      </div>
    );
  }
}

export default Show;
