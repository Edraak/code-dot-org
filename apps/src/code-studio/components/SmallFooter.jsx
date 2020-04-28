/* eslint-disable react/no-danger */
import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import debounce from 'lodash/debounce';

const MenuState = {
  MINIMIZING: 'MINIMIZING',
  MINIMIZED: 'MINIMIZED',
  EXPANDED: 'EXPANDED'
};

export default class SmallFooter extends React.Component {
  static propTypes = {
    // We let dashboard generate our i18n dropdown and pass it along as an
    // encode string of html
    i18nDropdown: PropTypes.string,
    baseStyle: PropTypes.object,
    // True if we're displaying this inside a phone (real, or our wireframe)
    phoneFooter: PropTypes.bool,
    className: PropTypes.string,
    fontSize: PropTypes.number,
    rowHeight: PropTypes.number,
    fullWidth: PropTypes.bool,
    channel: PropTypes.string
  };

  state = {
    menuState: MenuState.MINIMIZED,
    baseWidth: 0,
    baseHeight: 0
  };

  componentDidMount() {
    this.captureBaseElementDimensions();
    window.addEventListener(
      'resize',
      debounce(this.captureBaseElementDimensions, 100)
    );
  }

  captureBaseElementDimensions = () => {
    const base = this.refs.base;
    this.setState({
      baseWidth: base.offsetWidth,
      baseHeight: base.offsetHeight
    });
  };

  minimizeOnClickAnywhere(event) {
    // The first time we click anywhere, hide any open children
    $(document.body).one(
      'click',
      function(event) {
        // menu copyright has its own click handler
        if (event.target === this.refs.menuCopyright) {
          return;
        }

        this.setState({
          menuState: MenuState.MINIMIZING,
          moreOffset: 0
        });

        // Create a window during which we can't show again, so that clicking
        // on copyright doesnt immediately hide/reshow
        setTimeout(
          function() {
            this.setState({menuState: MenuState.MINIMIZED});
          }.bind(this),
          200
        );
      }.bind(this)
    );
  }

  clickBase = () => {
    this.clickBaseMenu();
  };

  clickBaseMenu = () => {
    if (this.state.menuState === MenuState.MINIMIZING) {
      return;
    }

    if (this.state.menuState === MenuState.EXPANDED) {
      this.setState({menuState: MenuState.MINIMIZED});
      return;
    }

    this.setState({menuState: MenuState.EXPANDED});
    this.minimizeOnClickAnywhere();
  };

  render() {
    const styles = {
      smallFooter: {
        fontSize: this.props.fontSize
      },
      base: {
        paddingBottom: 3,
        paddingTop: 3,
        // subtract top/bottom padding from row height
        height: this.props.rowHeight ? this.props.rowHeight - 6 : undefined
      },
      // Additional styling to base, above.
      baseFullWidth: {
        width: '100%',
        boxSizing: 'border-box'
      },
      listItem: {
        height: this.props.rowHeight,
        // account for padding (3px on top and bottom) and bottom border (1px)
        // on bottom border on child anchor element
        lineHeight: this.props.rowHeight
          ? this.props.rowHeight - 6 - 1 + 'px'
          : undefined
      }
    };
    const combinedBaseStyle = {
      ...styles.base,
      ...this.props.baseStyle,
      ...(this.props.fullWidth && styles.baseFullWidth)
    };

    return (
      <div className={this.props.className} style={styles.smallFooter}>
        <div
          className="small-footer-base"
          ref="base"
          style={combinedBaseStyle}
          onClick={this.clickBase}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: decodeURIComponent(this.props.i18nDropdown)
            }}
          />
        </div>
      </div>
    );
  }
}

window.dashboard = window.dashboard || {};
window.dashboard.SmallFooter = SmallFooter;
