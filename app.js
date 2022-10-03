const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const { open } = sqlite;
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDBandServer = async () => {
  try {
    app.listen(3000, () => {
      console.log("Server Running on Port 3000");
    });
    db = await open({ filename: dbPath, driver: sqlite3.Database });
  } catch (error) {
    console.log(`DB Encountered Error :${e.message}`);
    process.exit(1);
  }
};

initializeDBandServer();

const conversionOfDBObjectToResponseObjectForAPI1 = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const conversionOfDBObjectToResponseObjectForAPI4 = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

const conversionOfDBObjectToResponseObjectForAPI7 = (dbObject) => {
  //   console.log(dbObject);
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    totalScore: dbObject.total_score,
    totalFours: dbObject.total_fours,
    totalSixes: dbObject.total_sixes,
  };
};

// API-1 Get All Players

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
                            select 
                                * 
                            from 
                                player_details;
                            `;
  const playersArray = await db.all(getPlayersQuery);
  const responsePlayersArray = playersArray.map((eachPlayer) =>
    conversionOfDBObjectToResponseObjectForAPI1(eachPlayer)
  );
  //   console.log(responsePlayersArray);
  response.send(responsePlayersArray);
});

// API-2 Get Specific Player Based on PlayerId

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  //   console.log(playerId);
  const getPlayerQuery = `
                            select 
                                * 
                            from 
                                player_details
                            where
                                player_id = ${playerId} ;
                            `;
  const playerArray = await db.get(getPlayerQuery);
  const responsePlayerArray = conversionOfDBObjectToResponseObjectForAPI1(
    playerArray
  );
  response.send(responsePlayerArray);
});

// API-3 Update Player Details
app.put("/players/:player_Id/", async (request, response) => {
  const { player_Id } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `update 
                                    player_details 
                                set 
                                    player_name = '${playerName}'
                                    where player_id = ${player_Id};`;
  const dbResponse = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// API-4 Get Specific Match Details Based on MatchId

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  //   console.log(matchId);
  const getMatchQuery = `
                            select 
                                * 
                            from 
                                match_details
                            where
                                match_id = ${matchId} ;
                            `;
  const matchArray = await db.get(getMatchQuery);
  const responseMatchArray = conversionOfDBObjectToResponseObjectForAPI4(
    matchArray
  );
  response.send(responseMatchArray);
});

// API-5 Get All Match Details Based on PlayerId

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  //   console.log(matchId);
  const getMatchesQuery = `
                            select 
                                * 
                            from 
                                player_match_score natural join match_details
                            where
                                player_id = ${playerId} ;
                            `;
  const matchesArray = await db.all(getMatchesQuery);
  const responseMatchesArray = matchesArray.map((eachMatch) =>
    conversionOfDBObjectToResponseObjectForAPI4(eachMatch)
  );
  response.send(responseMatchesArray);
});

// API-6 Get All Players Details Based on MatchId

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  //   console.log(matchId);
  const getPlayersQuery = `
                            select 
                                * 
                            from 
                                player_match_score natural join player_details
                            where
                                match_id = ${matchId} ;
                            `;
  const playersArray = await db.all(getPlayersQuery);
  const responsePlayersArray = playersArray.map((eachPlayer) =>
    conversionOfDBObjectToResponseObjectForAPI1(eachPlayer)
  );
  response.send(responsePlayersArray);
});

// API-7 Get Stats of a Specific Player

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  //   console.log(request.params);
  const getPlayerStatsQuery = `
                            select 
                                *,
                                sum(score) as total_score,
                                sum(fours) as total_fours,
                                sum(sixes) as total_sixes
                            from 
                                player_match_score natural join player_details
                            where
                                player_id = ${playerId} ;
                            `;
  const statsArray = await db.get(getPlayerStatsQuery);
  //   console.log(statsArray);

  const responseStatsArray = conversionOfDBObjectToResponseObjectForAPI7(
    statsArray
  );
  response.send(responseStatsArray);
});

module.exports = app;
