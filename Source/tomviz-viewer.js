/* eslint-disable import/prefer-default-export */

// CSS loading ----------------------------------------------------------------

import 'font-awesome/css/font-awesome.css';
import 'normalize.css';
import 'babel-polyfill';

// Global import --------------------------------------------------------------

import React    from 'react';
import ReactDOM from 'react-dom';

import 'paraviewweb/src/React/CollapsibleControls/CollapsibleControlFactory/QueryDataModelWidget';

import GenericViewer      from 'paraviewweb/src/React/Viewers/ImageBuilderViewer';
import GeometryViewer     from 'paraviewweb/src/React/Viewers/GeometryViewer';
import QueryDataModel     from 'paraviewweb/src/IO/Core/QueryDataModel';
import LookupTableManager from 'paraviewweb/src/Common/Core/LookupTableManager';
import URLExtract         from 'paraviewweb/src/Common/Misc/URLExtract';

import ImageQueryDataModelViewer from 'arctic-viewer/lib/types/ImageQueryDataModel';
import VTKGeometry               from 'arctic-viewer/lib/types/VTKGeometry';
import VTKVolume                 from 'arctic-viewer/lib/types/VTKVolume';

// Resource images -----------------------------------------------------------

import link from './tomvizLink.png';

// Global variables -----------------------------------------------------------

// React UI map
const ReactClassMap = {
  GenericViewer,
  GeometryViewer,
};

const iOS = /iPad|iPhone|iPod/.test(window.navigator.platform);
const lookupTableManager = new LookupTableManager();
const dataViewers = [
  ImageQueryDataModelViewer,
  VTKGeometry,
  VTKVolume,
];

// Add class to body if iOS device --------------------------------------------

if (iOS) {
  document.querySelector('body').classList.add('is-ios-device');
}

// ----------------------------------------------------------------------------

function fetchBinary(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = (e) => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0) {
          resolve(xhr.response);
        } else {
          reject(xhr, e);
        }
      }
    };

    // Make request
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.send();
  });
}

// ----------------------------------------------------------------------------

function viewerBuilder(basepath, data, config, callback) {
  let foundViewer = false;
  let viewerCount = dataViewers.length;

  const dataType = data.type;
  const viewer = {
    ui: 'GenericViewer',
    config,
    allowMagicLens: false,
    userData: {},
  };

  // Initializer shared variables
  config.lookupTableManager = lookupTableManager;

  // Update background if available
  if (data && data.metadata && data.metadata.backgroundColor) {
    viewer.bgColor = data.metadata.backgroundColor;
  }

  // Update QueryDataModel if needed
  if (dataType.indexOf('tonic-query-data-model') !== -1) {
    viewer.queryDataModel = config.queryDataModel || new QueryDataModel(data, basepath);
  }

  // Find the right viewer and build it
  const args = { basepath, data, callback, viewer, dataType };
  while (viewerCount && !foundViewer) {
    viewerCount -= 1;
    foundViewer = dataViewers[viewerCount](args);
  }

  setImmediate(() => callback(viewer));
  return foundViewer;
}

// ----------------------------------------------------------------------------

function createUI(viewer, container, callback) {
  if (viewer.bgColor && viewer.ui !== 'MultiViewerWidget') {
    container.style[(viewer.bgColor.indexOf('gradient') !== -1) ? 'background' : 'background-color'] = viewer.bgColor;
  }

  // Make sure we trigger a render when the UI is mounted
  setImmediate(() => {
    var renderers = viewer.renderers || {};
    Object.keys(renderers).forEach((name) => {
      if (renderers[name].builder && renderers[name].builder.update) {
        renderers[name].builder.update();
      }
    });
    if (viewer.imageBuilder && viewer.imageBuilder.update) {
      viewer.imageBuilder.update();
    }
  });

  // Unmount any previously mounted React component
  ReactDOM.unmountComponentAtNode(container);

  if (viewer.ui === 'ReactComponent') {
    ReactDOM.render(viewer.component, container, callback);
  } else {
    viewer.component = ReactDOM.render(React.createElement(ReactClassMap[viewer.ui], viewer), container, callback);
  }
}


// Expose viewer factory method -----------------------------------------------

export function load(container, dataProvider = 'html', dataURL = null) {
  return new Promise((resolve, reject) => {
    const basedir = (dataProvider === 'html') ? 'data/' : '';
    const rootQueryDataModel = new QueryDataModel({
      type: [],
      arguments: {},
      data: [
        {
          name: '_',
          pattern: `${basedir}index.json`,
          type: 'json',
        },
      ],
      arguments_order: [],
      metadata: {},
    }, '');

    rootQueryDataModel.onDataChange((json) => {
      viewerBuilder(basedir, json._.data, {}, (viewer) => {
        if (!viewer) {
          /* eslint-disable no-alert */
          alert('The metadata format seems to be unsupported.');
          /* eslint-enable no-alert */
          reject();
        }
        createUI(viewer, container, () => resolve({ viewer, container }));
      });
    });
    if (dataProvider === 'html') {
      rootQueryDataModel.useHtmlContent();
      rootQueryDataModel.fetchData();
    } else if (dataProvider === 'zip' && dataURL) {
      fetchBinary(dataURL).then((content) => {
        rootQueryDataModel.useZipContent(content)
          .then(() => {
            rootQueryDataModel.fetchData();
          });
      });
    } else {
      console.log('don\'t know what to load.');
    }
  });
}

// Be ready for file drop -----------------------------------------------------

const container = document.querySelector('.react-content');

const bodyStyle = document.querySelector('body').style;
bodyStyle.position = 'absolute';
bodyStyle.width = '100vw';
bodyStyle.height = '100vh';

const linkImageSelector = document.querySelector('.linkImage');
if (linkImageSelector) {
  linkImageSelector.src = link;
}

export function ready() {
  load(container);
}


export function loadData(url) {
  load(container, 'zip', url);
}

// Animation helpers ----------------------------------------------------------

function animateCamera(viewer, name, value, interval, geometryHandler) {
  setInterval(() => {
    const { camera, render } = geometryHandler;
    if (viewer.animating) {
      camera[name](value);
      render();
    }
  }, interval);
}

function animate(viewer, name, interval, value = 1) {
  if (viewer.queryDataModel.getValues(name)) {
    setInterval(() => {
      const { queryDataModel, animating } = viewer;
      if (animating) {
        queryDataModel.next(name);
        queryDataModel.fetchData();
      }
    }, interval);
  } else if (viewer.geometryBuilder && viewer.geometryBuilder.getActiveCamera && viewer.geometryBuilder.render) {
    // Animation parameter not on query data model
    const camera = viewer.geometryBuilder.getActiveCamera();
    const render = viewer.geometryBuilder.render;
    animateCamera(viewer, name, value, interval, { camera, render });
  }
}

function createCameraInitialization(geometryBuilder, methodName, value) {
  return () => {
    console.log(methodName, value);
    const camera = geometryBuilder.getActiveCamera();
    camera[methodName](value);
  };
}

// Viewer automatic usage -----------------------------------------------------

export function initializeViewers() {
  const viewers = document.querySelectorAll('.tomviz-data-viewer');
  let count = viewers.length;
  while (count--) {
    const el = viewers[count];
    if (!el.dataset.loaded) {
      el.dataset.loaded = true;
      const [width, height] = (el.dataset.viewport || '500x500').split('x');
      el.style.position = 'relative';
      el.style.width = Number.isFinite(Number(width)) ? `${width}px` : width;
      el.style.height = Number.isFinite(Number(height)) ? `${height}px` : height;
      load(el, 'zip', el.dataset.url)
        .then(({ viewer }) => {
          let addDoubleClick = false;
          // Apply style on viewer
          if (el.dataset.noUi !== undefined) {
            el.querySelector('.jsAbstractViewMenuControl').style.display = 'none';
            addDoubleClick = true;
          }

          if (el.dataset.noMouse !== undefined) {
            viewer.userData.disableMouseListener = true;
            addDoubleClick = true;
          }

          if (el.dataset.backgroundColor && viewer.geometryBuilder) {
            const color = el.dataset.backgroundColor;
            const bgColor = [color.slice(0, 2), color.slice(2, 4), color.slice(4, 6)].map(v => (parseInt(v, 16) / 255));
            viewer.geometryBuilder.getRenderer().setBackground(bgColor);
          }

          if (el.dataset.initialization) {
            const defaults = URLExtract.extractURLParameters(false, el.dataset.initialization);
            Object.keys(defaults).forEach((name) => {
              if (viewer.queryDataModel.getValues(name)) {
                viewer.queryDataModel.setValue(name, defaults[name]);
              } else if (viewer.geometryBuilder && viewer.geometryBuilder.addInitializationAction) {
                viewer.geometryBuilder.addInitializationAction(createCameraInitialization(viewer.geometryBuilder, name, defaults[name]));
              }
            });
            viewer.queryDataModel.fetchData();
          }

          if (el.dataset.animation) {
            addDoubleClick = true;
            viewer.animating = true;
            const anim = URLExtract.extractURLParameters(true, el.dataset.animation);
            const step = URLExtract.extractURLParameters(true, el.dataset.step || '');
            Object.keys(anim).forEach((name) => {
              animate(viewer, name, anim[name], step[name]);
            });
          }

          if (addDoubleClick) {
            el.addEventListener('dblclick', () => {
              viewer.animating = !viewer.animating;
              viewer.userData.disableMouseListener = viewer.animating;
              el.querySelector('.jsAbstractViewMenuControl').style.display = viewer.animating ? 'none' : 'block';

              // Push property change
              if (viewer.component) {
                viewer.component.forceUpdate();
              }
            });
          }
        });
    }
  }
}

// Ensure processing of viewers
setTimeout(initializeViewers, 0);
setTimeout(initializeViewers, 500);
setTimeout(initializeViewers, 1000);

// ----------------------------------------------------------------------------

global.ready = ready;
global.loadTomvizData = loadData;
