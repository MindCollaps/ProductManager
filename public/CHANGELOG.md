# Changelog

## v0.0.3

### Reparaturwert-Tile
- Neue Darstellung: Reparaturwert (grün) vs. Neukaufwert (gelb) als Hero-Cards
- Tile jetzt auch auf der Staff-Anfragendetailseite sichtbar
- Berechnung: Arbeitsstunden × Stundensatz + Teilekosten

### Ersatzteile
- Beim Auswählen eines Katalogteils wird der Retail-Preis automatisch als geschätzte Kosten vorausgefüllt
- Löschen eines Arbeitsschritts entfernt jetzt alle zugehörigen Teilebestellungen (Cascade Delete)

### Mitarbeiter-Zuweisung
- Anfragen können einem Mitarbeiter zugewiesen werden (auswählbar über Dropdown auf der Detailseite)
- Zuweisung wird per PUT auf der Anfrage gespeichert und ist jederzeit änderbar

### Ersatzteilkatalog (Admin)
- Verwaltung des Teilekatalogs ausschließlich durch Admins (`/admin/parts`)
- Staff kann Teile weiterhin Schritten zuweisen, aber den Katalog nicht mehr bearbeiten

### Weiterleitungskorrektur
- Staff- und Admin-Nutzer werden beim Klick auf „Requests" direkt zu `/staff/request` geleitet

### Bugfixes
- Leere Seiten bei `/admin/*/new`-Routen behoben (Watch ohne `immediate: true`)
- Dropdown-Text im Selector war unsichtbar (Farbe `$typographySecondary` = gleiche Farbe wie Hintergrund)
- Dropdown öffnete beim ersten Klick die komplette Liste; jetzt öffnet nur der Pfeil-Toggle die Gesamtliste

---

## v0.0.2

### Authentifizierung & Sessions
- Auto-Logout bei abgelaufenem Token (401-Interceptor in `useAuthFetch` + Pinia `logout()`)
- Globaler Fehler-Handler für 401 als Sicherheitsnetz

### Reparaturkatalog-API
- `crud()`-Factory für alle Admin- und Staff-Routen: typsichere Generics, kein `any`, kein `unknown`
- `notFoundMessage` auf Config-Ebene, optionales `delete: {}` (Auto-Delete), optionales `get.run`

### Encapsulation
- `useAdminEdit(apiBase, listPath)`-Composable fasst Route, Router, Toast und Fetch für alle Admin-Editseiten zusammen
- Duplizierter Scaffold in vier Admin-Seiten entfernt

### TypeScript-Fixes
- `InputText.vue` / `TextArea.vue`: `currentLength` possibly undefined behoben
- `UiColorPicker.vue`: falscher Default-Typ behoben
- Prisma v7: interner `@prisma/client/runtime/library`-Import entfernt, strukturellen Typ `DecimalLike` eingeführt
- `rateLimit.ts`: falscher Importpfad `./redis` → `../cache/redis` behoben

---

## v0.0.1

### Grundfunktionen
- Registrierung, Login, E-Mail-Verifizierung, Passwort-Reset
- Reparaturanfragen: Erstellen (Kunde), Anzeigen, Annehmen/Ablehnen (Staff)
- Arbeitsschritte mit Status PENDING / IN_PROGRESS / DONE
- Echtzeit-Chat pro Anfrage via Socket.IO
- In-App-Benachrichtigungen mit Badge, Mark-All-Read, Delete-Read
- Reparaturstatus-Phasen (RECEIVED bis ARCHIVED)
- Statushistorie
- Archiv- und Verlaufssicht
- Admin-Kataloge: Geräte, Marken, Kategorien, Arbeitsschritttypen
- Systemkonfiguration: Stundensatz
