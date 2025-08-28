# Elpriset

## Slutprojekt i min utbildning till fullstack-utvecklare i Lexicon

Jag vill helst göra något som jag vill använda själv, och kom fram till en webb app där man ska kunna se elpriset för dagen timme för timme och på så sätt planera sin förbrukning. Min sambo kan se spotpriset genom sin app och sin inloggning då hon står på el avtalet. Men då timpriserna är dom samma för alla i ett el-område fick jag idén om att ha en enkel app på en enkel adress (https://elpriset.netlify.app), så att man snabbt kan se när det är som billigast och när man det är som dyrast, så att man kan undvika att förbruka el just då.
Hämtar in aktuella priser timme för timme för dagen genom något lämpligt api (Nordpool?). Tänker att man kan lägga till saker som "tvätta", "dammsuga", "diskmaskin" och ställa in hur lång tid varje sak tar. Då kan appen säga när på dygnet det passar och jämföra det med morgondagen. Det kan också varna om att det är dyrt just nu, eller kommande timmar. Initialt tänker jag begränsa det till sverige så jag tänker att man väljer sitt elområde på en karta eller dropdown.

Inloggning ger möjlighet till att lagra sina "sysslor" och varaktighet. Exempelvis hur lång tid ungefär man dammsuger, hur långa tvättprogram man har, diskmaskinens tid, bil med mera. Så att man kan stänga ner sidan och ändå få fram vad man har planerat. Dessa lagrade sysslor ska med lätthet kunna läggas till i timmar under dagen, som en slags todo-larm.

Från mobilen ska det vara enkelt och tydligt, från större skärm en mer omfattande dashboard vy.

## 🛠 Teknologier

- ⚛️ **React** – UI-bibliotek för dynamisk rendering
- ⚡ **Vite** – Blixtsnabb utvecklingsmiljö
- 🧹 **ESLint** – Kodkvalitet och formattering
- 🎨 **Tailwind** – Styling
- 💡 **Web API** - Hämtning av elpriser
- 🧰 **Supabase** För inloggning och databaser
