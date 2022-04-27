const fs = require("fs");
const dbFile = "./.data/erisport.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
let db;

function isEmpty(str) {
  return (!str || str.length === 0 );
}

dbWrapper
  .open({
    filename: dbFile,
    driver: sqlite3.Database
  })
  .then(async dBase => {
    db = dBase;

    try {
      if (!exists) {
        await db.run(
          "CREATE TABLE Members (teamid TEXT, firstname TEXT, middlename TEXT, lastname TEXT, dob TEXT, email TEXT, photo TEXT)"
        );
        await db.run(
          "CREATE TABLE Teams (teamid TEXT, division TEXT, teamname TEXT, city TEXT, year TEXT, managername TEXT, manageremail TEXT, managerphone TEXT, coachname TEXT, coachemail TEXT, coachphone TEXT, assistantname TEXT, assistantemail TEXT, assistantphone TEXT)"   
        );
        await db.run(
            "CREATE TABLE Registrations (teamid TEXT, teamname TEXT, teamemail TEXT, isregistered INT)"
        );

        for(var i=1; i<=32; i++){
            var x;
            if(i<10){
                x = "0"+i;
            } else {
                x = ""+i;
            }
            await db.run(
                `INSERT INTO Registrations (teamid, isregistered) VALUES ('ES2022${x}', 0)`
              );
        }
      } 
    } catch (dbError) {
      console.error(dbError);
    }
  });


  module.exports = {
    getRestration: async () => {
        try {
          return await db.all("SELECT * from Registrations");
        } catch (dbError) {
          console.error(dbError);
        }
      },
      getTeam: async (teamId) => {
        try {
          return await db.all("SELECT * from Teams WHERE teamId = ?", teamId);
        } catch (dbError) {
          console.error(dbError);
        }
      },
      getTeams: async () => {
        try {
          return await db.all("SELECT * from Teams");
        } catch (dbError) {
          console.error(dbError);
        }
      },
      getMembersByTeam: async (teamId) => {
        try {
          return await db.all("SELECT * from Members WHERE teamId = ?", teamId);
        } catch (dbError) {
          console.error(dbError);
        }
      },
      saveTeam : async(team, teamId) => {
        try{
          var division = team.division;
          var teamname = team.teamname;
          var city = team.city;
          var year = team.year;
          var managername = team.managername;
          var manageremail = team.manageremail;
          var managerphone = team.managerphone;
          var coachname = team.coachname;
          var coachemail = team.coachemail;
          var coachphone = team.coachphone;
          var assistantemail = team.assistantemail;
          var assistantname = team.assistantname;
          var assistatntphone = team.assistatntphone;
          
          await db.run("INSERT INTO Teams (teamid, division, teamname, city, year, managername, manageremail, managerphone, coachname, coachemail, coachphone, assistantname, assistantemail, assistantphone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
            teamId,
            division,
            teamname,
            city,
            year,
            managername,
            manageremail,
            managerphone,
            coachname,
            coachemail,
            coachphone,
            assistantname,
            assistantemail,
            assistatntphone
          ]);
          for(var i=1; i<=22; i++){
            var firstname = team["firstname"+i];
            var middlename = team["middlename"+i];
            var lastname = team["lastname"+i];
            var dob = team["dob"+i];
            var email = team["email"+i];
            var photo = team["photo"+i];
            if(isEmpty(firstname) || isEmpty(lastname)) continue;
            await db.run("INSERT INTO Members (teamid, firstname, middlename, lastname, dob, email, photo) VALUES (?, ?, ?, ?, ?, ?, ?)", [
              teamId,
              firstname,
              middlename,
              lastname,
              dob,
              email,
              photo
            ]);
          }
        } catch (dbError) {
          console.error(dbError);
        }
      }
  };
