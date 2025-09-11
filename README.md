# Elpriset

## Slutprojekt i min utbildning till fullstack-utvecklare i Lexicon

Jag vill helst göra något som jag vill använda själv, och kom fram till en webb app där man ska kunna se elpriset för dagen timme för timme och på så sätt planera sin förbrukning. Min sambo kan se spotpriset genom sin app och sin inloggning då hon står på elavtalet. Men då timpriserna är dom samma för alla i ett el-område fick jag idén om att ha en enkel app på en enkel adress (https://elpriset.netlify.app), så att man snabbt kan se när det är som billigast och när det är som dyrast, så att man kan undvika att förbruka el just då.
Hämtar in aktuella priser timme för timme för dagen genom något lämpligt api (Nordpool?). Tänker att man kan lägga till saker som "tvätta", "dammsuga", "diskmaskin" och ställa in hur lång tid varje sak tar. Då kan appen säga när på dygnet det passar och jämföra det med morgondagen. Det kan också varna om att det är dyrt just nu, eller kommande timmar. Initialt tänker jag begränsa det till Sverige så jag tänker att man väljer sitt elområde på en karta eller dropdown.

Inloggning ger möjlighet till att lagra sina "sysslor" och varaktighet. Exempelvis hur lång tid ungefär man dammsuger, hur långa tvättprogram man har, diskmaskinens tid, bil med mera. Så att man kan stänga ner sidan och ändå få fram vad man har planerat. Dessa lagrade sysslor ska med lätthet kunna läggas till i timmar under dagen, som en slags todo-larm.

Från mobilen ska det vara enkelt och tydligt, från större skärm en mer omfattande dashboard vy.

## 🛠 Teknologier
I utkastet av readme-filen som jag bad AI ta fram så fanns VITE och ESLINT med som teknologier, men jag tar inte med dom av samma anledning som jag inte tar med VS code som teknologi hehe.

- ⚛️ **React** – UI-bibliotek för dynamisk rendering.
  Det är lätt att komma igång och ett praktiskt sätt att bygga frontend. Men där finns ett djup av kunskap som har tar tid att bemästra.
  
- 🎨 **Tailwind** – Styling
  Väldigt praktiskt css metod som bygger på hjälpklasser
  
- 💡 **Web API** - Hämtning av elpriser
  
- 🧰 **Supabase** - För inloggning och databaser med funktioner
  PostgreSQL och Procedural Language

Jag valde vanlig javascript och react för detta projekt för att bli ännu bättre på reakt & PostgreSQL och lära mig Procedural Language. Om tidsbudgeten var större så skulle jag ha valt Next.js, GraphQL och typescript, men jag skulle behövt mer tid för att lära mig det tillräckligt bra för slutprojektet. Serverside logiken hamnar då istället på supabase i Procedural Language, med sina funktioner, triggers och stored procedures.

GANNT schema för återstående tid
<img width="1768" height="319" alt="Skärmbild 2025-08-29 155851" src="https://github.com/user-attachments/assets/e5c80584-baba-4715-8dca-7bbf6051a252" />

## AI

Att använda ai i utvecklingssammanhang är som att sammarbeta med en programmerare eller en designer som har hög talang men kan ibland ändå göra misstag eller missförstå uppdraget. Du är uppdragsgivaren och det gäller att formulera uppraget så bra som möjligt från början. Som fullstackutvecklare får man göra en bedömning samtidigt om inte det är snabbare att göra uppgiften själv. Jag har funnit att det oftast är allra bäst att sammarbeta med AI om det går att snabbt bedömma att det är korrekt utfört. Förstår man inte vad det har gjort är det inte så lätt korrigera i efterhand.
