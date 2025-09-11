# Elpriset

## Slutprojekt i min utbildning till fullstack-utvecklare i Lexicon

Jag vill helst göra något som jag vill använda själv, och kom fram till en webb app där man ska kunna se elpriset för dagen timme för timme och på så sätt planera sin förbrukning. Min sambo kan se spotpriset genom sin app och sin inloggning då hon står på elavtalet. Men då timpriserna är dom samma för alla i ett el-område fick jag idén om att ha en enkel app på en enkel adress (https://elpriset.netlify.app), så att man snabbt kan se när det är som billigast och när det är som dyrast, så att man kan undvika att förbruka el just då.
Hämtar in aktuella priser timme för timme för dagen genom något lämpligt api (Nordpool?). Tänker att man kan lägga till saker som "tvätta", "dammsuga", "diskmaskin" och ställa in hur lång tid varje sak tar. Då kan appen säga när på dygnet det passar och jämföra det med morgondagen. Initialt tänker jag begränsa det till Sverige så jag tänker att man väljer sitt elområde på en karta eller dropdown.
<br />
<img width="1534" height="776" alt="Skärmbild 2025-09-11 120241" src="https://github.com/user-attachments/assets/28c69ed5-f0fe-4f43-97de-7c4b220ba535" />
<i> Graf med priser som visar både den lägsta och de högsta timmarna. En av aktiviteterna har varaktigheten 3, därför visas 3 staplar </i>
<br />
<br />
Inloggning ger möjlighet till att lagra sina "sysslor" och varaktighet. Exempelvis hur lång tid ungefär man dammsuger, hur långa tvättprogram man har, diskmaskinens tid, bil med mera. Så att man kan stänga ner sidan och ändå få fram vad man har planerat.

Fördelen av att ställa in sysslor är att man får hjälp att veta när man ska börja. Är det något som bara tar en timme är det lätt att hitta vägledning på andra sidor, de brukar ha en graf som visar timmen med lägst spotpris. Men är det en aktivitet som tar flera timmar behöver man ta hänsyn till timmarna innan och efter den lägsta och min app gör denna beräkning och tar fram den bästa startiden för hela tidsspannet. Har man fler aktiviteter kan starttiden bli någon helt annat för dessa.


## 🛠 Teknologier
I utkastet av readme-filen som jag bad AI ta fram så fanns VITE och ESLINT med som teknologier, men jag tar inte med dom av samma anledning som jag inte tar med VS code som teknologi hehe.

- ⚛️ **React** – UI-bibliotek för dynamisk rendering.
  Det är lätt att komma igång och ett praktiskt sätt att bygga frontend. Men där finns ett djup av kunskap som har tar tid att bemästra.
  
- 🎨 **Tailwind** – Styling
  Väldigt praktiskt css metod som bygger på hjälpklasser
  
- 💡 **Web API** - Hämtning av elpriser
  
- 🧰 **Supabase** - Serverside; inloggning + databaser
  PostgreSQL och Procedural Language

Jag valde vanlig javascript och react för detta projekt för att bli ännu bättre på reakt & PostgreSQL och lära mig Procedural Language. Om tidsbudgeten var större så skulle jag ha valt Next.js, GraphQL och typescript, men jag skulle behövt mer tid för att lära mig det tillräckligt bra för slutprojektet. Serverside logiken hamnar då istället på supabase i Procedural Language, med sina funktioner, triggers och stored procedures. Användningen av policies gör det säkrare att ha SQL anropen på klientsidan när man kan bestämma vilka som får göra vad i varje tabell. Populerande av tabeller görs automatiskt vid första inlogg med triggers och funktioner. En post läggs till i profiles tabellen med data från google inloggning, och i tasks tabellen så kopieras alla aktiviteter som inte har användarID och får användarens ID. 

Många funktioner som finns där ger ingen direkt nytta men visar att jag kan ta fram en UI lösning där man interagerar på olika sätt och arbeta med data till och från databaser. Redigeringarna sker på ett direkt sätt då jag inte känner att det är känslig information. När man byter tema eller elområde så sparas det utan något extra steg. Är man inloggad så lagras det på databasen kopplat till användaren, i annat fall lagras det lokalt. Aktiviteternas titel ändrar man genom att klicka på titeln, då blir den redigerbar, och klickar man utanför eller trycker på enter så lagras det man skrivit. Ikonen för aktiviteten lagras när man ställer in det. Samma med antalet timmar.

Är man inloggad med rollen "admin" i sin profil får man ett admin-gränsnitt där användarna listas upp med bild, namn, email, roll, elområde och vald tema. Klickar man på dessa får man fram den användarens aktiviteter och en varning som för att påminna administratören om att det är den valda personens aktiviteter (ev ändringarna görs direkt på vald användare). Detta är förståss skyddat av en policy på supabase som bara låter dig göra detta om din googleinloggnig kan kopplas till rollen admin.

<br />
<img width="1546" height="843" alt="Skärmbild 2025-09-11 112317" src="https://github.com/user-attachments/assets/76a287b6-0d8b-40b9-9cc6-6efbc332e9ba" />
<i> Administratör-gränsnitt </i>
<br /><br /><br />
GANNT schema för återstående tid
<img width="1768" height="319" alt="Skärmbild 2025-08-29 155851" src="https://github.com/user-attachments/assets/e5c80584-baba-4715-8dca-7bbf6051a252" />

## AI

Att använda ai i utvecklingssammanhang är som att sammarbeta med en programmerare eller en designer som har hög talang men kan ibland ändå göra misstag eller missförstå uppdraget. Du är uppdragsgivaren och det gäller att formulera uppraget så bra som möjligt från början. Som fullstackutvecklare får man göra en bedömning samtidigt om inte det är snabbare att göra uppgiften själv. Jag har funnit att det oftast är allra bäst att sammarbeta med AI om det går att snabbt bedömma att det är korrekt utfört. Förstår man inte vad det har gjort är det inte så lätt korrigera i efterhand.
