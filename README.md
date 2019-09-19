# Henvendelse-les

Enkelt api mot data fra henvendelse-løsningen. 
Applikasjonen kobler seg direkte mot henvendelse sin database, men har kun lesetilgang til gitt database.

### Lokal utvikling med mock

Starter opp løsningen med [mock-data](/src/db/mockdb.ts).

```
npm run start:mock
``` 


### Lokal utvikling mot DB

Starter opp løsningen med koblig mot henvendelseDB (NB, må da være på nettverk med tilgang til denne, typisk utvikliger-image).
For å koble til databasen trengs brukernavn, passord og url å være definert, dette gjøres ved å lage en `.env` fil lokalt.

Eksempel på `db_user.env` fil (kan hentes ut direkte fra vault):
```
HENVENDELSE_DB_USERNAME=*************
HENVENDELSE_DB_PASSWORD=*************
HENVENDELSE_DB_URL=******************
```

Appen kan så startes;

```
npm run start
```