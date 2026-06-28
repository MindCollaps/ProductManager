# Changelog

## v0.5.0

### Staff-Anfragendetailseite (Komplettüberarbeitung)
- Neues Layout mit separaten Bereichen für Kundendetails, Reparaturfortschritt, Timeline und Einsparungsübersicht
- Aktionen „Abschließen", „Ablehnen", „Stornieren" und „Archivieren" mit Bestätigungs-Popup statt direktem Auslösen
- Hinweis, wenn noch nicht alle Arbeitsschritte abgeschlossen sind und die Anfrage daher nicht beendet werden kann
- Gerätezuordnung: neues `RepairDeviceSelectPopup` zum Verknüpfen eines Reparaturgeräts mit einer Anfrage
- Mitarbeiterzuweisung direkt auf der Detailseite änderbar
- Reparaturverlauf-Timeline und Einsparungstile jetzt auch auf der Staffseite sichtbar

### Startseite
- Zeigt jetzt rollenbasierte Navigationslinks (Kunden sehen ihre Anfragen, Staff/Admin sehen die Verwaltung)

### Kunden-Anfragenliste (Neu gestaltet)
- Skelett-Ladeanimation während des Ladens
- Leerer Zustand mit direktem Link zur neuen Anfrage
- Fehlerbehandlung mit „Erneut versuchen"-Button
- Kopfzeile mit „Neue Anfrage"-Button

### Staff-Anfragenliste (Neu gestaltet)
- Filterleiste: Freitextsuche nach Gerät + Statusfilter per Dropdown
- Anzeige der Warteschlangenposition pro Anfrage
- Skelett-Ladeanimation und Fehlerbehandlung
- Laufender Status wird auf Basis des ersten abgeschlossenen Arbeitsschritts berechnet

### Admin-Bereich (Komplettüberarbeitung)
- Kartenraster mit `minmax(220px, 1fr)` statt fixer 10%-Breite — Karten lesbar auf allen Bildschirmbreiten
- Erstellen-Button im Seitenkopf neben dem Titel, nicht mehr am Seitenende
- Inline-Löschbestätigung: Zwei-Klick-Muster mit 3-Sekunden-Timeout (kein Browser-Dialog mehr)
- Leere Zustände auf allen fünf Listenseiten
- Aufgabentypen: Icon wird als Icon dargestellt, nicht als Rohtext
- Alle Beschriftungen, Titel und Bestätigungen vollständig auf Deutsch
- Formularfelder bis zu 640 px breit; nach erfolgreichem Speichern automatische Rückkehr zur Liste

### Icon-Selektor
- Neue `UiIconPicker`-Komponente mit eingebetteter Suchleiste
- Suche läuft serverseitig gegen das lokal installierte `material-symbols`-Paket (16 336 Icons, kein externer API-Aufruf)
- Dropdown öffnet sich nach oben, wenn unterhalb nicht genug Platz vorhanden ist
- Aufgabentyp-Bearbeitungsseite nutzt den Selektor statt eines Freitextfelds

### Konfiguration
- `showTimelineToCustomer` ist jetzt standardmäßig aktiviert

### Technische Verbesserungen
- `useAuthFetch`: HTTP-401-Antworten lösen automatisch einen Logout aus
- Server-CRUD-Factory (`crud()`) überarbeitet: weniger Boilerplate, klarere Generics
- Teilekatalog-Verwaltung ausschließlich für Admins (war zuvor auch im Staff-Bereich)

### Bugfixes
- **Datenverlust:** Sort Order bei Aufgabentypen wurde beim Speichern stillschweigend verworfen (`fields[5]` in `save()` übersprungen)
- **Race condition:** Löschen wurde nicht abgewartet vor dem Refresh auf allen fünf Admin-Listenseiten
- **Doppelte Bestätigung:** `window.confirm()` blieb aktiv nachdem Inline-Bestätigung eingebaut wurde
- **Selector:** Dropdown öffnete beim ersten Klick die komplette Liste; Platzhalterfarbe war unsichtbar (falsche Farb-Variable)

---

## v0.0.4-alpha

### Reparaturverlauf-Timeline
- Neue `RepairTimeline`-Komponente: Gantt-Darstellung der Reparaturphasen mit Verweildauer pro Status
- Laufende Phase wird live hochgezählt (pulsierender Balken, Minuten-Tick)
- Auf der Staff-Anfragendetailseite immer sichtbar
- Auf der Kunden-Anfragenseite nur, wenn ein Admin „Reparaturverlauf für Kunden" aktiviert

### Admin-Konfiguration (neu strukturiert)
- Wiederverwendbare `SettingsSection`- und `SettingsRow`-Komponenten ersetzen den monolithischen Seitenaufbau
- Abschnitte: Kosten & Abrechnung, Sichtbarkeit, Demo-Modus
- Neuer Schalter „Reparaturverlauf für Kunden" (`showTimelineToCustomer`)

### Demo-Modus
- Admin-Schalter erzeugt einen Demo-User (`demo` / `demo`) mit 5 Beispiel-Aufträgen in verschiedenen Reparaturphasen
- Deaktivieren entfernt alle Demo-Daten (Aufträge, Katalogteile) und deaktiviert den User vollständig
- Alternativ per `DEMO_MODE`-Umgebungsvariable beim Start steuerbar
- Hinweisbanner auf der Login- und Konfigurationsseite, solange Demo aktiv ist
- Seed datengetrieben und typsicher aufgebaut (`seedWorkItems` / `seedStatusHistory`, keine impliziten `any`)

### Status-Benachrichtigungen per E-Mail
- Eigene E-Mail-Vorlagen für „Gerät empfangen" (RECEIVED) und „Gerät unterwegs" (ON_THE_WAY_TO_CUSTOMER)
- Wird eine Status-E-Mail versendet, überspringt die zugehörige In-App-Benachrichtigung den Digest (`skipDigest`)
- Auch die Annahme-Mail des Geräts läuft jetzt ohne doppelten Digest

### Benachrichtigungs-Panel
- Scrollbare Liste mit fixiertem Header und eigener Trennlinie

### Bugfixes & Code-Qualität
- Tippfehler `vartorgba` → `varToRgba` behoben (Platzhalterfarbe in `InputText` / `TextArea` wurde nicht berechnet)
- Timer-Leak in der Timeline behoben (`onUnmounted` korrekt auf Setup-Ebene registriert)
- „Mark Complete" / „Reject" / „Cancel" werden bei bereits abgeschlossenen Anfragen ausgeblendet
- Dropdown-Menü `z-index` erhöht, damit es über der Savings-Tile liegt
- Duplizierte Status-Notify-Logik in `repairStatus.ts` zu einem gemeinsamen Helper zusammengefasst
- `appConfigUpdateSchema` bleibt `.strict()` (lehnt unbekannte Felder weiterhin ab)
- `word-break: break-word` → `overflow-wrap: break-word` (deprecated-Keyword entfernt)

---

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
