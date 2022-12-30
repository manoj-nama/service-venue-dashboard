// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
const discovery = (req, res, next) => {
  const links = {
    'document:scan:status': res.hypermedia.template('status'),
    'document:scan:document-type': res.hypermedia.template('scan-document'),
  };
  return res.send(200, { _links: links });
};

module.exports = discovery;
