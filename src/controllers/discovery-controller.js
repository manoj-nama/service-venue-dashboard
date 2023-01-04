// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
const discovery = (req, res, next) => {
  try {
    const links = {
      'venue:status': res.hypermedia.template('status'),
      'venue:active:venues:users': res.hypermedia.template('getActiveVenuesAndUser'),
      'venue:most:active:users': res.hypermedia.template('getMostActiveUser'),
      'venue:amount:spent:per:venue': res.hypermedia.template('amount-spent-per-venue'),
      'venue:bets:placed:per:venue': res.hypermedia.template('bets-placed-per-venue'),
      'venue:add:bets:transactions': res.hypermedia.template('add-transactions'),
      'venue:add:new:users': res.hypermedia.template('createUser'),
      // 'venue:bet-stats:live-bets-ticker': res.hypermedia.template('bet-stats:live-bets-ticker'),
      // 'venue:bet-stats:big-bets': res.hypermedia.template('bet-stats:big-bets'),
      // 'venue:bet-stats:live-bets-ticker': res.hypermedia.template('bet-stats:heat-map'),
      // 'venue:bet-stats:distribution': res.hypermedia.template('bet-stats:distribution'),
    };
    return res.send(200, { _links: links });
  } catch (err) {
    throw err
  }
};

module.exports = discovery;
