import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import LazyLoad, { forceCheck } from 'react-lazyload';
import KeywordExtractor from 'keyword-extractor';

import './stylesheets/gif.css';
import './stylesheets/animate.css';

class Gif extends Component {
  static propTypes = {
    title: PropTypes.string,
    query: PropTypes.string,
    id: PropTypes.string,
    images: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      bgColor: this.rand('color-'),
      hashtags: [],
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.setHashtags();
  }

  setHashtags() {
    // create hashtags from gif title. remove appearances of 'gif' && *current search query*
    if (this.props.title) {
      const htreg = new RegExp(`${this.props.query}`, 'gi');
      let t = this.props.title.replace(/gif/gi, '');
      t = t.replace(htreg, '');
      const k = KeywordExtractor.extract(t, {
        language: 'english',
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true,
      });
      this.setState({
        // support 3 hashtags max
        hashtags: k.slice(0, 3),
      });
    }
  }

  rand(prefix) {
    // randomly generate number for loading gif background color. see line 88-110 in gif.css
    return prefix.toString() + (Math.floor(Math.random() * 6) + 1); // e.g. 'color-3'
  }

  handleShowGif = (event) => {
    // https://stackoverflow.com/questions/27223756/is-element-tagname-always-uppercase
    if (event.target.tagName !== 'LI') {
      location.href = `/g/${this.props.id}`;
    }
    return false;
  }

  gifClicked = () => {
  }

  gifLoaded = (e) => {
    e.target.style.display = 'block';
    // updates lazyload viewport
    forceCheck();
  }

  gifError = (error) => {
    console.log(error);
  }

  render() {
    const divStyle = {
      height: `${this.props.images.fixed_width.height}px`,
      width: `${this.props.images.fixed_width.width}px`,
    };

    return (
      <div className="grid-item" onClick={this.handleShowGif}>
        <div className={this.state.bgColor} style={divStyle}>
          <LazyLoad height={`${this.props.images.fixed_width.height}px`} offset={200}>
            <img
              src={this.props.images.fixed_width.url}
              height={this.props.images.fixed_width.height}
              width={this.props.images.fixed_width.width}
              alt={this.props.title}
              onLoad={this.gifLoaded}
              onError={this.gifError}
            />
          </LazyLoad>
          <div className="hashtags">
            <ul>
              {this.state.hashtags.map((h, i) => (
                <Link onClick={this.forceUpdate} key={i} to={{pathname: `/search/${h}`}}>
                  <li>#{h}</li>
                </Link>
              ))}
            </ul>
          </div>
          {/* <div className='source'>
                <a href={this.props.source} target='_BLANK'>source : {this.props.source}</a>
              </div> */
          }
        </div>
      </div>
    );
  }
}


export default Gif;
