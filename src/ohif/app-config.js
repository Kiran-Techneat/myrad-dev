/** @type {AppTypes.Config} */

// Capture backUrl at load time (before OHIF navigates internally and changes window.location).
// Passed as &backUrl=... on the iframe src so the logo always navigates to the right parent page.
const _ohifBackUrl = (new URLSearchParams(window.location.search)).get('backUrl') || '/images';

// Patch 1: Make the OHIF back-arrow navigate the top-level frame to backUrl.
// Patch 2: Fix responsive overlap — OHIF header children use absolute positioning with hardcoded
//   left-[250px] offsets that collide with the logo on narrow screens. We locate the header inner
//   container via data-cy="return-to-work-list" and switch it to flex-wrap with inline styles so
//   the toolbar row wraps below the logo instead of overlapping it.
(function () {
  var _mriHeaderPatched = false;

  function applyResponsiveHeader(returnDiv) {
    if (_mriHeaderPatched) return;
    // Walk up: returnDiv → logo wrapper → inner header container (relative h-[48px])
    var innerHeader = returnDiv.parentElement && returnDiv.parentElement.parentElement;
    if (!innerHeader) return;
    _mriHeaderPatched = true;

    function relayout() {
      var narrow = window.innerWidth < 900;
      if (narrow) {
        // Switch inner header to flex-wrap so absolute children reflow as flex items
        Object.assign(innerHeader.style, {
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          height: 'auto',
          padding: '4px 0',
          position: 'relative',
        });
        // Children: reset absolute positioning so they participate in flex flow
        var children = Array.from(innerHeader.children);
        children.forEach(function (child, i) {
          Object.assign(child.style, {
            position: 'relative',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            transform: 'none',
          });
        });
        // Logo row (first child): full width → toolbar starts on next line
        if (children[0]) children[0].style.width = '100%';
        // Secondary toolbar (second child): left-aligned on tool row
        if (children[1]) { children[1].style.flex = '0 0 auto'; }
        // Primary/center toolbar (third child): centered, fills remaining space
        if (children[2]) {
          Object.assign(children[2].style, {
            flex: '1 1 auto',
            display: 'flex',
            justifyContent: 'center',
          });
        }
        // Right panel (fourth child): push to far right
        if (children[3]) {
          Object.assign(children[3].style, { marginLeft: 'auto', flex: '0 0 auto' });
        }
      } else {
        // Wide screen: clear all overrides so OHIF's Tailwind layout takes over
        Object.assign(innerHeader.style, {
          display: '', flexWrap: '', alignItems: '', height: '', padding: '', position: '',
        });
        Array.from(innerHeader.children).forEach(function (child) {
          Object.assign(child.style, {
            position: '', top: '', left: '', right: '', transform: '',
            width: '', flex: '', justifyContent: '', marginLeft: '',
          });
        });
      }
    }

    relayout();
    window.addEventListener('resize', relayout);
  }

  var observer = new MutationObserver(function () {
    var returnDiv = document.querySelector('[data-cy="return-to-work-list"]');
    if (returnDiv && !returnDiv._mriPatched) {
      returnDiv._mriPatched = true;
      returnDiv.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        e.preventDefault();
        e.stopPropagation();
        window.top.location.href = _ohifBackUrl;
      }, true);
      applyResponsiveHeader(returnDiv);
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

window.config = {
  name: 'config/default.js',
  routerBasename: '/ohif',
  // whiteLabeling: {},
  extensions: [],
  modes: [],
  customizationService: {},
  investigationalUseDialog: { option: 'never' },
  showStudyList: false,
  // some windows systems have issues with more than 3 web workers
  maxNumberOfWebWorkers: 3,
  // below flag is for performance reasons, but it might not work for all servers
  showWarningMessageForCrossOrigin: true,
  showCPUFallbackMessage: true,
  showLoadingIndicator: true,
  experimentalStudyBrowserSort: false,
  strictZSpacingForVolumeViewport: true,
  groupEnabledModesFirst: true,
  allowMultiSelectExport: false,
  maxNumRequests: {
    interaction: 100,
    thumbnail: 75,
    // Prefetch number is dependent on the http protocol. For http 2 or
    // above, the number of requests can be go a lot higher.
    prefetch: 25,
  },
  showErrorDetails: 'always', // 'always', 'dev', 'production'
  // filterQueryParam: false,
  // Defines multi-monitor layouts
  multimonitor: [
    {
      id: 'split',
      test: ({ multimonitor }) => multimonitor === 'split',
      screens: [
        {
          id: 'ohif0',
          screen: null,
          location: {
            screen: 0,
            width: 0.5,
            height: 1,
            left: 0,
            top: 0,
          },
          options: 'location=no,menubar=no,scrollbars=no,status=no,titlebar=no',
        },
        {
          id: 'ohif1',
          screen: null,
          location: {
            width: 0.5,
            height: 1,
            left: 0.5,
            top: 0,
          },
          options: 'location=no,menubar=no,scrollbars=no,status=no,titlebar=no',
        },
      ],
    },

    {
      id: '2',
      test: ({ multimonitor }) => multimonitor === '2',
      screens: [
        {
          id: 'ohif0',
          screen: 0,
          location: {
            width: 1,
            height: 1,
            left: 0,
            top: 0,
          },
          options: 'fullscreen=yes,location=no,menubar=no,scrollbars=no,status=no,titlebar=no',
        },
        {
          id: 'ohif1',
          screen: 1,
          location: {
            width: 1,
            height: 1,
            left: 0,
            top: 0,
          },
          options: 'fullscreen=yes,location=no,menubar=no,scrollbars=no,status=no,titlebar=no',
        },
      ],
    },
  ],
  defaultDataSourceName: 'ohif',
  /* Dynamic config allows user to pass "configUrl" query string this allows to load config without recompiling application. The regex will ensure valid configuration source */
  // dangerouslyUseDynamicConfig: {
  //   enabled: true,
  //   // regex will ensure valid configuration source and default is /.*/ which matches any character. To use this, setup your own regex to choose a specific source of configuration only.
  //   // Example 1, to allow numbers and letters in an absolute or sub-path only.
  //   // regex: /(0-9A-Za-z.]+)(\/[0-9A-Za-z.]+)*/
  //   // Example 2, to restricts to either hosptial.com or othersite.com.
  //   // regex: /(https:\/\/hospital.com(\/[0-9A-Za-z.]+)*)|(https:\/\/othersite.com(\/[0-9A-Za-z.]+)*)/
  //   regex: /.*/,
  // },
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'ohif',
      configuration: {
        friendlyName: 'AWS S3 Static wado server',
        name: 'aws',
        wadoUriRoot: 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb',
        qidoRoot: 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb',
        wadoRoot: 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb',
        qidoSupportsIncludeField: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: true,
        supportsWildcard: false,
        staticWado: true,
        singlepart: 'bulkdata,video',
        // whether the data source should use retrieveBulkData to grab metadata,
        // and in case of relative path, what would it be relative to, options
        // are in the series level or study level (some servers like series some study)
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
          transform: url => url.replace('/pixeldata.mp4', '/rendered'),
        },
        omitQuotationForMultipartRequest: true,
      },
    },

    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'ohif2',
      configuration: {
        friendlyName: 'AWS S3 Static wado secondary server',
        name: 'aws',
        wadoUriRoot: 'https://dd14fa38qiwhyfd.cloudfront.net/dicomweb',
        qidoRoot: 'https://dd14fa38qiwhyfd.cloudfront.net/dicomweb',
        wadoRoot: 'https://dd14fa38qiwhyfd.cloudfront.net/dicomweb',
        qidoSupportsIncludeField: false,
        supportsReject: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: false,
        supportsWildcard: true,
        staticWado: true,
        singlepart: 'bulkdata,video',
        // whether the data source should use retrieveBulkData to grab metadata,
        // and in case of relative path, what would it be relative to, options
        // are in the series level or study level (some servers like series some study)
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
        },
        omitQuotationForMultipartRequest: true,
      },
    },
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'ohif3',
      configuration: {
        friendlyName: 'AWS S3 Static wado secondary server',
        name: 'aws',
        wadoUriRoot: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb',
        qidoRoot: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb',
        wadoRoot: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb',
        qidoSupportsIncludeField: false,
        supportsReject: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: false,
        supportsWildcard: true,
        staticWado: true,
        singlepart: 'bulkdata,video',
        // whether the data source should use retrieveBulkData to grab metadata,
        // and in case of relative path, what would it be relative to, options
        // are in the series level or study level (some servers like series some study)
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
        },
        omitQuotationForMultipartRequest: true,
      },
    },

    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'local5000',
      configuration: {
        friendlyName: 'Static WADO Local Data',
        name: 'DCM4CHEE',
        qidoRoot: 'http://localhost:5000/dicomweb',
        wadoRoot: 'http://localhost:5000/dicomweb',
        qidoSupportsIncludeField: false,
        supportsReject: true,
        supportsStow: true,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: false,
        supportsWildcard: true,
        staticWado: true,
        singlepart: 'video',
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
        },
      },
    },
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'orthanc',
      configuration: {
        friendlyName: 'local Orthanc DICOMWeb Server',
        name: 'DCM4CHEE',
        wadoUriRoot: 'http://localhost/pacs/dicom-web',
        qidoRoot: 'http://localhost/pacs/dicom-web',
        wadoRoot: 'http://localhost/pacs/dicom-web',
        qidoSupportsIncludeField: true,
        supportsReject: true,
        dicomUploadEnabled: true,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: true,
        supportsWildcard: true,
        omitQuotationForMultipartRequest: true,
        bulkDataURI: {
          enabled: true,
          // This is an example config that can be used to fix the retrieve URL
          // where it has the wrong prefix (eg a canned prefix).  It is better to
          // just use the correct prefix out of the box, but that is sometimes hard
          // when URLs go through several systems.
          // Example URLS are:
          // "BulkDataURI" : "http://localhost/dicom-web/studies/1.2.276.0.7230010.3.1.2.2344313775.14992.1458058363.6979/series/1.2.276.0.7230010.3.1.3.1901948703.36080.1484835349.617/instances/1.2.276.0.7230010.3.1.4.1901948703.36080.1484835349.618/bulk/00420011",
          // when running on http://localhost:3003 with no server running on localhost.  This can be corrected to:
          // /orthanc/dicom-web/studies/1.2.276.0.7230010.3.1.2.2344313775.14992.1458058363.6979/series/1.2.276.0.7230010.3.1.3.1901948703.36080.1484835349.617/instances/1.2.276.0.7230010.3.1.4.1901948703.36080.1484835349.618/bulk/00420011
          // which is a valid relative URL, and will result in using the http://localhost:3003/orthanc/.... path
          // startsWith: 'http://localhost/',
          // prefixWith: '/orthanc/',
        },
      },
    },

    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomwebproxy',
      sourceName: 'dicomwebproxy',
      configuration: {
        friendlyName: 'dicomweb delegating proxy',
        name: 'dicomwebproxy',
        // Security controls for runtime ?url=... datasource loading:
        // In authenticated environments, runtime ?url origins must be allowlisted:
        // dangerouslyAllowedOriginsForAuthenticatedEnvironments: [
        //   'https://config.example.com',
        //   'http://localhost:5000',
        // ],
      },
    },
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomjson',
      sourceName: 'dicomjson',
      configuration: {
        friendlyName: 'dicom json',
        name: 'json',
        // Security controls for runtime ?url=... datasource loading:
        // In authenticated environments, runtime ?url origins must be allowlisted:
        // dangerouslyAllowedOriginsForAuthenticatedEnvironments: [
        //   'https://config.example.com',
        //   'http://localhost:5000',
        // ],
      },
    },
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomlocal',
      sourceName: 'dicomlocal',
      configuration: {
        friendlyName: 'dicom local',
      },
    },
  ],
  httpErrorHandler: error => {
    // This is 429 when rejected from the public idc sandbox too often.
    console.warn(error.status);

    // Could use services manager here to bring up a dialog/modal if needed.
    console.warn('test, navigate to https://ohif.org/');
  },
  // segmentation: {
  //   segmentLabel: {
  //     enabledByDefault: true,
  //     labelColor: [255, 255, 0, 1], // must be an array
  //     hoverTimeout: 1,
  //     background: 'rgba(100, 100, 100, 0.5)', // can be any valid css color
  //   },
  // },
  whiteLabeling: {
    createLogoComponentFn: function (React) {
      return React.createElement(
        'a',
        {
          target: '_top',
          rel: 'noopener noreferrer',
          className: 'header-brand',
          href: _ohifBackUrl,
          style: {
            display: 'flex',
            alignItems: 'center',
            height: '40px',
            textDecoration: 'none'
          }
        },
        React.createElement('img', {
          src: '/ohif/logo.png',
          style: {
            height: '32px',
            objectFit: 'contain'
          }
        })
      );
    },
  },
};
