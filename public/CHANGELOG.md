# Changelog

## v0.0.7

### Echtzeit-Reparaturansicht

- Kunden- und Mitarbeiter-Detailseite aktualisieren sich jetzt automatisch, wenn sich der Reparaturstatus ändert – kein manuelles Neuladen mehr nötig.
- Neue Socket.IO-Events `repair:watch` / `repair:unwatch` für gezieltes Abonnieren einer Anfrage; der Server sendet `repair:update` bei jeder Statusänderung.

### Zuweisungen

- **„Mir zuweisen" auf Anfragendetailseite (Staff):** Mitarbeiter können sich selbst direkt als Bearbeiter einer Anfrage eintragen, ohne den Dropdown zu öffnen.
- **„Mir zuweisen" auf Arbeitsschritt-Karten:** Jeder Schritt zeigt einen Direktzuweisungs-Button, wenn der eingeloggte Mitarbeiter noch nicht zugewiesen ist.

### Bestätigungsdialoge

- **Schritt löschen:** Ersetzt `window.confirm()` durch ein Modal-Popup mit dem Schrittnamen und rotem Löschen-Button.
- **Schritte zurücksetzen:** Neues Bestätigungs-Popup bevor alle Schritte durch Standardschritte ersetzt werden.
- Zurücksetzen-Button ist während laufender Anfragen deaktiviert (`isBusy`).

### Fehlerbehandlung

- Alle Arbeitsschritt-Operationen (Speichern, Löschen, Status-Toggle) haben jetzt `try/catch` mit aussagekräftigen Toast-Fehlermeldungen.
- Gerät-Auswahl-Popup zeigt jetzt einen Toast-Fehler, wenn das Formular ohne Geräteauswahl abgeschickt wird.
- Arbeitsschritt-Editor zeigt einen Toast-Fehler, wenn kein Arbeitsschritttyp gewählt wurde.

### Arbeitsschritttyp-Filterung

- Der Arbeitsschritt-Editor filtert verfügbare Typen nach der aktuellen Phase (via `minSortOrder`/`maxSortOrder`).
- API `GET /api/v1/admin/work-item-type` unterstützt jetzt Query-Parameter `minSortOrder` und `maxSortOrder` zur Filterung nach Phasen-Reihenfolge.

### Reparatur-Timeline

- Balkenbreiten werden jetzt korrekt auf den verbleibenden Platz begrenzt – kein Überlaufen mehr bei kurzen Zeiträumen.
- Linke Position wird auf 0 geklammert, um negative Offsets zu verhindern.
- Alle Statusfarben auf stärkere Töne angepasst, um ≥ 4,5:1 Kontrast auf weißem Text zu gewährleisten.
- Pulsanimation des aktiven Balkens respektiert jetzt `prefers-reduced-motion`.
- Status `ON_THE_WAY_TO_SHOP` heißt jetzt „Anfahrt" statt „Unterwegs".

### Übersetzungen

- Alle verbleibenden englischen Texte in Arbeitsschritt-Editor, Karten und Phasen-Übersichten ins Deutsche übersetzt: Status-Optionen, Buttons, Labels, Fehlerbeschreibungen, Phasen-Leer-Zustände.
- `assignedStaffLabel` zeigt „Nicht zugewiesen" statt „Unassigned".

### UI-Verbesserungen

- Arbeitsschritt-Karten: `border-radius` auf 8 px vereinheitlicht, Verlaufshintergrund entfernt, Typografie bereinigt.
- Einsparungen-Kachel: `border-radius` auf 8 px reduziert, Uppercase-Labels entfernt.
- Teile-Liste in `RepairWorkItemParts`: semantisches `<ul>/<li>`-Markup, Status als Pill-Badge (Umrandung + subtiler Hintergrund), roter Abbrechen-Button für Stornierung.

### Toast-System

- Toast-Hintergrund jetzt im App-Dunkeldesign (`$darkgray875`), mit Rahmen statt Box-Shadow.
- ARIA-Rollen: `role="alert"` für Fehler/Warnung, `role="status"` für Info/Erfolg.
- Fortschrittsbalken zeigt visuell die verbleibende Anzeigedauer an; wird bei `prefers-reduced-motion` ausgeblendet.
- Container-Layout verwendet jetzt Flexbox statt fragiler Pixelpositionierung – funktioniert korrekt mit mehrzeiligen Nachrichten.
- Enter- und Leave-Übergänge korrigiert; smoothes Nachrücken bei Schließen via FLIP-Animation.

---

## v0.0.6

### Dashboard (Komplettüberarbeitung)

- **Rollenbasiert:** Das Dashboard zeigt je nach Nutzerrolle unterschiedliche Inhalte auf einen Blick.
- **Warteschlange (Staff/Admin):** Live-Kachel mit Zähler für prüfpflichtige und aktive Anfragen; eingebettete Liste der fünf dringlichsten offenen Aufträge (WAITING_FOR_REVIEW zuerst), inkl. Skeleton-Ladezustand.
- **Statistiken (Staff/Admin):** Neue Statistiken-Kachel mit vier Abschnitten:
  - *Geräte* – meistreparierten Geräte aus dem Katalog; Freitext-Marken als Fallback für nicht verknüpfte Anfragen.
  - *Häufige Defekte* – häufigste Arbeitsschritttypen der Reparaturphase (orderIndex 30–89), z. B. Batteriewechsel, Teileaustausch, Löten.
  - *Meistgenutzte Teile* – am häufigsten bestellte Ersatzteile aus Reparaturschritten.
  - *Team-Auswertung* – aktive und abgeschlossene Aufträge pro Mitarbeiter (nur sichtbar bei mehr als einem Mitarbeiter).
- **Schnellzugriff (Admin):** Kachelraster mit Direktlinks zu allen Verwaltungsbereichen (Geräte, Kategorien, Marken, Schritttypen, Ersatzteile, Konfiguration).
- **Verlauf-Link (Staff):** Direktlink zu `/staff/history`.
- **Kunden:** Kachel mit eigenen aktiven Anfragen und Statusbadges; Leer-Zustand mit CTA zur neuen Anfrage; Link zur Gesamtübersicht.

### Neue API

- **`GET /api/v1/staff/stats`** – Liefert aggregierte Dashboard-Statistiken: meistreparierten Geräte, häufige Defekttypen (nach Arbeitsschritttyp), meistgenutzte Teile, Team-Auslastung. Nur für Staff und Admin.

### Verlauf (`/staff/history`)

- Skeleton-Ladezustand und Fehlerzustand mit „Erneut versuchen"-Button.
- Deutsche Datumsformatierung (`TT.MM.JJJJ`).
- Gerät, Modell und Marke als Mittelpunkt-getrennte Zeile; Fehlerbeschreibung zweizeilig gekürzt.
- Reparaturstatus wird korrekt aus dem letzten `statusHistory`-Eintrag aufgelöst.

### Profil (`/profile`)

- Seite neu aufgebaut mit `SettingsSection`-Layout: Benutzername und Rolle strukturiert dargestellt.
- Abmelden-Button als destruktive Aktion klar hervorgehoben.

### Chat (`/chat/room/[id]`)

- Überarbeitetes Layout: schmalere Nachrichtenblasen, klarere Zeitstempel, verbesserte Lesbarkeit eigener vs. fremder Nachrichten.
- Skeleton-Ladezustand für den initialen Nachrichtenabruf.
- Verbessertes Eingabefeld mit konsistentem Fokuszustand.

### Benachrichtigungen (`ViewNotifications`)

- Komplett überarbeitetes Panel: Zeitstempel, Markiert-als-gelesen-Logik und Leer-Zustand neu gestaltet.
- Bessere visuelle Trennung zwischen gelesenen und ungelesenen Benachrichtigungen.

### Reparatur-Ansicht

- `RepairStepGraph`: überarbeitete Schritt-Phasen-Darstellung mit verbessertem Spacing und Statusfarben.
- `RepairWorkItemCard`: kompakteres Layout, konsistente Abstände.

### Startseite, Login & Registrierung

- `index.vue`, `login.vue`, `signup.vue`: durchgehend überarbeitetes Design mit einheitlichen Formularelementen, verbesserter Typografie und responsivem Layout.

### Navigation

- `ViewMenu.vue`: überarbeitete Hauptnavigation mit klarerer aktiver-Link-Markierung und verbessertem mobilen Verhalten.

---

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
