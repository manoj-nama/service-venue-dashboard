const s = require('strummer');

const DOCUMENT_TYPE = s({
  documentType:  s.enum({ values: ['driving-licence'] }),
});

const SCAN_DOCUMENT_REQ = s({
  inputImages: s.array({
    of: {
      imageFormat: s.enum({ values: ['jpg', 'jpeg', 'bmp'] }),
      name: s.enum({ values: ['WhiteImage', 'NearInfraredImage', 'SelfiePhoto', 'UltravioletImage'] }),
      data: s.string(),
    }})})

module.exports = {
  DOCUMENT_TYPE,
  SCAN_DOCUMENT_REQ
};