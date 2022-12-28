
const discovery = (req, res) => {
  const links = {
    'document:scan:status': res.hypermedia.template('status'),
    'document:scan:document-type': res.hypermedia.template('scan-document'),
  };
  return res.send(200, { _links: links });
};

module.exports = discovery;
