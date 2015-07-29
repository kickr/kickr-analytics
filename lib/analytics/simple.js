import forEach from 'lodash/collection/forEach';

import sortBy from 'lodash/collection/sortBy';

import takeRight from 'lodash/array/takeRight';

import take from 'lodash/array/take';


class Statistics {

  constructor() {
    this.teamMap = {};
    this.playerMap = {};
  }

  add(match) {

    var t1o = match.team1_offense_id;
    var t1d = match.team1_defense_id;

    var t2o = match.team2_offense_id;
    var t2d = match.team2_defense_id;

    var team1 = [t1o, t1d];
    var team2 = [t2o, t2d];

    var t1Stats = this.getTeamStats(team1);
    var t2Stats = this.getTeamStats(team2);

    var t1oStats = this.getPlayerStats(t1o);
    var t1dStats = this.getPlayerStats(t1d);

    var t2oStats = this.getPlayerStats(t2o);
    var t2dStats = this.getPlayerStats(t2d);

    var result = {
      team1: team1,
      team2: team2,
      team1Wins: match.team1Wins,
      team2Wins: match.team2Wins,
      totalGames: match.totalGames
    };

    if (result.team1Wins > result.team2Wins) {
      t1Stats.wins.push(result);
      t2Stats.losses.push(result);

      t1oStats.wins.push(result);
      t2oStats.losses.push(result);

      if (t1o !== t1d) {
        t1dStats.wins.push(result);
      }

      if (t2o !== t2d) {
        t2dStats.losses.push(result);
      }
    } else
    if (result.team1Wins < result.team2Wins) {
      t1Stats.losses.push(result);
      t2Stats.wins.push(result);

      t1oStats.losses.push(result);
      t2oStats.wins.push(result);

      if (t1o !== t1d) {
        t1dStats.losses.push(result);
      }

      if (t2o !== t2d) {
        t2dStats.wins.push(result);
      }
    } else {
      t1Stats.ties.push(result);
      t2Stats.ties.push(result);

      t1oStats.ties.push(result);
      t2oStats.ties.push(result);

      if (t1o !== t1d) {
        t1dStats.ties.push(result);
      }

      if (t2o !== t2d) {
        t2dStats.ties.push(result);
      }
    }
  }

  getTeamStats(players) {

    var keys = players.slice();

    keys.sort();

    var key = keys.join('#');

    var entry = this.teamMap[key];

    if (!entry) {
      this.teamMap[key] = entry = {
        wins: [],
        losses: [],
        ties: [],
        players: keys
      };
    }

    return entry;
  }

  logTeamEntry(entry) {
    console.log(`${entry.players}: W${entry.wins.length} L${entry.losses.length}`);
  }

  logPlayerEntry(entry) {
    console.log(`${entry.player}: W${entry.wins.length} L${entry.losses.length}`);
  }

  getPlayerStats(player) {

    var key = player;

    var entry = this.playerMap[key];

    if (!entry) {
      this.playerMap[key] = entry = {
        wins: [],
        losses: [],
        ties: [],
        player: player
      };
    }

    return entry;
  }

  logStatistics(entries, title, log) {

    console.log()
    console.log(`most ${title}`);

    forEach(takeRight(entries, 5), log);

    console.log()
    console.log(`least ${title}`);

    forEach(take(entries, 5), log);

    console.log()
    console.log()
  }


  log() {

    console.log();
    console.log('### TEAM STATS ###');

    var teamsByWins = sortBy(this.teamMap, function(entry) {
      return entry.wins.length;
    });

    this.logStatistics(teamsByWins, 'wins', this.logTeamEntry);


    var teamsByLosses = sortBy(this.teamMap, function(entry) {
      return entry.losses.length;
    });

    this.logStatistics(teamsByLosses, 'losses', this.logTeamEntry);


    var teamsByGames = sortBy(this.teamMap, function(entry) {
      return entry.losses.length + entry.wins.length;
    });

    this.logStatistics(teamsByGames, 'games', this.logTeamEntry);



    var teamsByWinLossRatio = sortBy(this.teamMap, function(entry) {
      return (1.0 + entry.wins.length) / (1.0 + entry.wins.length + entry.losses.length);
    });

    this.logStatistics(teamsByWinLossRatio, 'win/total ratio', this.logTeamEntry);


    var teamsByWinLossDifference = sortBy(this.teamMap, function(entry) {
      return (entry.wins.length - entry.losses.length);
    });

    this.logStatistics(teamsByWinLossDifference, 'win-loss difference', this.logTeamEntry);



    console.log();
    console.log('### PLAYER STATS ###');

    var playersByGames = sortBy(this.playerMap, function(entry) {
      return (entry.wins.length + entry.losses.length);
    });

    this.logStatistics(playersByGames, 'games', this.logPlayerEntry);


    var playersByWinLossRatio = sortBy(this.playerMap, function(entry) {
      return (1.0 + entry.wins.length) / (1.0 + entry.wins.length + entry.losses.length);
    });

    this.logStatistics(playersByWinLossRatio, 'win/total ratio', this.logPlayerEntry);


    var playersByWinLossDifference = sortBy(this.playerMap, function(entry) {
      return (entry.wins.length - entry.losses.length);
    });

    this.logStatistics(playersByWinLossDifference, 'win-loss difference', this.logPlayerEntry);

  }
}


export default class SimpleAnalytics {

  constructor(connection) {
    this.connection = connection;

    this.stats = new Statistics();
  }

  async analyse() {

    var stats = this.stats;
    var connection = this.connection;

    var matches = await connection.query('SELECT * from kickr_match');

    matches.forEach(function(match) {
      stats.add(match);
    });
  }

  printResults() {
    this.stats.log();
  }

}