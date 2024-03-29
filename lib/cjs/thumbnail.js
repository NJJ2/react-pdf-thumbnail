'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var core = require('@react-pdf-viewer/core');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () {
                        return e[k];
                    }
                });
            }
        });
    }
    n['default'] = e;
    return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespace(React);

var classNames = function (classes) {
    var result = [];
    Object.keys(classes).forEach(function (clazz) {
        if (clazz && classes[clazz]) {
            result.push(clazz);
        }
    });
    return result.join(' ');
};

var scrollToBeVisible = function (ele, container) {
    var top = ele.getBoundingClientRect().top - container.getBoundingClientRect().top;
    var eleHeight = ele.clientHeight;
    var containerHeight = container.clientHeight;
    if (top < 0) {
        container.scrollTop += top;
        return;
    }
    if (top + eleHeight <= containerHeight) {
        return;
    }
    container.scrollTop += top + eleHeight - containerHeight;
};

var ThumbnailItem = function (_a) {
    var page = _a.page, pageHeight = _a.pageHeight, pageWidth = _a.pageWidth, rotation = _a.rotation, thumbnailHeight = _a.thumbnailHeight, thumbnailWidth = _a.thumbnailWidth;
    var renderTask = React__namespace.useRef();
    var _b = React__namespace.useState(''), src = _b[0], setSrc = _b[1];
    React__namespace.useEffect(function () {
        var task = renderTask.current;
        if (task) {
            task.cancel();
        }
        var canvas = document.createElement('canvas');
        var canvasContext = canvas.getContext('2d', { alpha: false });
        var w = thumbnailWidth;
        var h = w / (pageWidth / pageHeight);
        var scale = w / pageWidth;
        canvas.height = h;
        canvas.width = w;
        canvas.style.height = h + "px";
        canvas.style.width = w + "px";
        var viewport = page.getViewport({ rotation: rotation, scale: scale });
        renderTask.current = page.render({ canvasContext: canvasContext, viewport: viewport });
        renderTask.current.promise.then(function () { return setSrc(canvas.toDataURL()); }, function () { });
    }, [rotation]);
    return (!src
        ? React__namespace.createElement(core.Spinner, null)
        : React__namespace.createElement("img", { src: src, height: thumbnailHeight + "px", width: thumbnailWidth + "px" }));
};

var THUMBNAIL_WIDTH = 100;
var ThumbnailContainer = function (_a) {
    var doc = _a.doc, isActive = _a.isActive, pageHeight = _a.pageHeight, pageIndex = _a.pageIndex, pageWidth = _a.pageWidth, rotation = _a.rotation, onActive = _a.onActive;
    var _b = React__namespace.useState({
        height: pageHeight,
        isCalculated: false,
        page: null,
        viewportRotation: 0,
        width: pageWidth,
    }), pageSize = _b[0], setPageSize = _b[1];
    var visibilityRef = React__namespace.useRef({
        isVisible: false,
        ratio: 0,
    });
    var isCalculated = pageSize.isCalculated, page = pageSize.page, height = pageSize.height, width = pageSize.width;
    var scale = width / height;
    var isVertical = Math.abs(rotation) % 180 === 0;
    var w = isVertical ? THUMBNAIL_WIDTH : (THUMBNAIL_WIDTH / scale);
    var h = isVertical ? (THUMBNAIL_WIDTH / scale) : THUMBNAIL_WIDTH;
    React__namespace.useLayoutEffect(function () {
        if (!isActive) {
            return;
        }
        var ele = containerRef.current;
        var visibility = visibilityRef.current;
        if (!visibility.isVisible || visibility.ratio < 1) {
            onActive(ele);
        }
    }, [isActive]);
    var onVisibilityChanged = function (params) {
        visibilityRef.current = params;
        if (params.isVisible && !isCalculated) {
            doc.getPage(pageIndex + 1).then(function (pdfPage) {
                var viewport = pdfPage.getViewport({ scale: 1 });
                setPageSize({
                    height: viewport.height,
                    isCalculated: true,
                    page: pdfPage,
                    viewportRotation: viewport.rotation,
                    width: viewport.width,
                });
            });
        }
    };
    var rotationNumber = (rotation + pageSize.viewportRotation) % 360;
    var containerRef = core.useIntersectionObserver({
        onVisibilityChanged: onVisibilityChanged,
    });
    return (React__namespace.createElement("div", { className: 'rpv-thumbnail__container', ref: containerRef, style: {
            height: h + "px",
            width: w + "px",
        } }, !page
        ? React__namespace.createElement(core.Spinner, null)
        : (React__namespace.createElement(ThumbnailItem, { page: page, pageHeight: isVertical ? height : width, pageWidth: isVertical ? width : height, rotation: rotationNumber, thumbnailHeight: h, thumbnailWidth: w }))));
};

var ThumbnailList = function (_a) {
    var currentPage = _a.currentPage, doc = _a.doc, pageHeight = _a.pageHeight, pageWidth = _a.pageWidth, rotation = _a.rotation, onJumpToPage = _a.onJumpToPage;
    var numPages = doc.numPages;
    var containerRef = React__namespace.useRef(null);
    var scrollToThumbnail = function (target) {
        var container = containerRef.current;
        if (container) {
            scrollToBeVisible(target.parentElement, container);
        }
    };
    return (React__namespace.createElement("div", { ref: containerRef, className: 'rpv-thumbnail__list' }, Array(numPages).fill(0).map(function (_, index) { return (React__namespace.createElement("div", { className: classNames({
            'rpv-thumbnail__item': true,
            'rpv-thumbnail__item--selected': currentPage === index,
        }), key: "thumbnail-" + index, onClick: function () { return onJumpToPage(index); } },
        React__namespace.createElement(ThumbnailContainer, { doc: doc, isActive: currentPage === index, pageHeight: pageHeight, pageIndex: index, pageWidth: pageWidth, rotation: rotation, onActive: scrollToThumbnail }))); })));
};

var ThumbnailListWithStore = function (_a) {
    var store = _a.store, onThumbnailClick = _a.onThumbnailClick;
    var _b = React__namespace.useState(store.get('doc')), currentDoc = _b[0], setCurrentDoc = _b[1];
    var _c = React__namespace.useState(store.get('currentPage') || 0), currentPage = _c[0], setCurrentPage = _c[1];
    var _d = React__namespace.useState(store.get('pageHeight') || 0), pageHeight = _d[0], setPageHeight = _d[1];
    var _e = React__namespace.useState(store.get('pageWidth') || 0), pageWidth = _e[0], setPageWidth = _e[1];
    var _f = React__namespace.useState(store.get('rotation') || 0), rotation = _f[0], setRotation = _f[1];
    var handleCurrentPageChanged = function (currentPageIndex) {
        setCurrentPage(currentPageIndex);
    };
    var handleDocumentChanged = function (doc) {
        setCurrentDoc(doc);
    };
    var handlePageHeightChanged = function (height) {
        setPageHeight(height);
    };
    var handlePageWidthChanged = function (width) {
        setPageWidth(width);
    };
    var handleRotationChanged = function (currentRotation) {
        setRotation(currentRotation);
    };
    var jump = function (pageIndex) {
        var jumpToPage = store.get('jumpToPage');
        if (jumpToPage) {
            jumpToPage(pageIndex);
        }
        if (onThumbnailClick) {
            onThumbnailClick(pageIndex);
        }
    };
    React__namespace.useEffect(function () {
        store.subscribe('doc', handleDocumentChanged);
        store.subscribe('pageHeight', handlePageHeightChanged);
        store.subscribe('pageWidth', handlePageWidthChanged);
        store.subscribe('rotation', handleRotationChanged);
        return function () {
            store.unsubscribe('doc', handleDocumentChanged);
            store.unsubscribe('pageHeight', handlePageHeightChanged);
            store.unsubscribe('pageWidth', handlePageWidthChanged);
            store.unsubscribe('rotation', handleRotationChanged);
        };
    }, []);
    core.useIsomorphicLayoutEffect(function () {
        store.subscribe('currentPage', handleCurrentPageChanged);
        return function () {
            store.unsubscribe('currentPage', handleCurrentPageChanged);
        };
    }, []);
    return (currentDoc
        ? (React__namespace.createElement(ThumbnailList, { currentPage: currentPage, doc: currentDoc, pageHeight: pageHeight, pageWidth: pageWidth, rotation: rotation, onJumpToPage: jump }))
        : React__namespace.createElement("div", { className: 'rpv-thumbnail__loader' },
            React__namespace.createElement(core.Spinner, null)));
};

var thumbnailPlugin = function () {
    var store = React__namespace.useMemo(function () { return core.createStore({}); }, []);
    var ThumbnailsDecorator = function (props) { return (React__namespace.createElement(ThumbnailListWithStore, { store: store, onThumbnailClick: props.onThumbnailClick })); };
    return {
        install: function (pluginFunctions) {
            store.update('jumpToPage', pluginFunctions.jumpToPage);
        },
        onDocumentLoad: function (props) {
            store.update('doc', props.doc);
        },
        onViewerStateChange: function (viewerState) {
            store.update('currentPage', viewerState.pageIndex);
            store.update('pageHeight', viewerState.pageHeight);
            store.update('pageWidth', viewerState.pageWidth);
            return viewerState;
        },
        Thumbnails: ThumbnailsDecorator,
    };
};

exports.thumbnailPlugin = thumbnailPlugin;
