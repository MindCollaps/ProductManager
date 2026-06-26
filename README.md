# Product Manager

Modernes Reparatur- und Auftragsmanagement für Werkstätten, Service-Teams und Ersatzteilprozesse.

## Überblick

ProductManager bildet den kompletten Weg einer Reparaturanfrage ab: vom ersten Kunden-Login über die Anfrage, die interne Bearbeitung und Kommunikation bis hin zur Ersatzteilverwaltung, Statusverfolgung und Reparaturwert-Auswertung.

## Implementierte Funktionen

### Kundenbereich
- Registrierung und Login mit E-Mail-Verifizierung
- Neue Reparaturanfragen erstellen (Gerät, Problembeschreibung, Verdacht)
- Eigene Anfragen und deren Status einsehen
- Echtzeit-Chat pro Anfrage
- In-App-Benachrichtigungen mit Badge-Zähler (als gelesen markieren, löschen)
- Reparaturwert-Tile: Gegenüberstellung Reparaturkosten (grün) vs. Neukaufwert (gelb)
- Reparatur-Graph der Arbeitsschritte in Lesansicht

### Staff-Bereich
- Übersicht und Detailansicht aller Reparaturanfragen
- Anfragen annehmen, ablehnen, abschließen, stornieren, archivieren
- Mitarbeiter einer Anfrage zuweisen
- Arbeitsschritte (Work Items) anlegen, bearbeiten, löschen
  - Status: PENDING, IN_PROGRESS, DONE
  - Mitarbeiter-Zuweisung pro Schritt
  - Standardschritte zurücksetzen
- Ersatzteil-Bestellungen pro Arbeitsschritt
  - Teile aus dem Katalog hinzufügen (Menge, Lieferant, Kostenschätzung)
  - Statusverlauf: DRAFT → ORDERED → SHIPPED → RECEIVED → INSTALLED
- Reparaturgerät anlegen und bearbeiten (Seriennummer, Anzeigename, Notizen)
- Reparaturstatus-Phasen setzen (RECEIVED → IN_DIAGNOSIS → WAITING_FOR_PARTS → IN_REPAIR → IN_QA → IN_OUTGOING → ...)
- Chat mit Kunden
- Verlauf / Archiv abgeschlossener Aufträge
- Reparaturwert-Tile

### Admin-Bereich (Obermenge von Staff)
- Gerätekatalog verwalten (Geräte, Marken, Kategorien)
- Arbeitsschritttypen verwalten
- Ersatzteilkatalog verwalten (Name, Hersteller, SKU, Einkaufs- und Verkaufspreis)
- Systemkonfiguration (Stundensatz für Arbeitskostenberechnung)

### Echtzeit & Hintergrund
- Socket.IO für Chat-Nachrichten und Benachrichtigungs-Badges
- Automatische Zustandssynchronisation (Anfragestatus aus Arbeitsschritt-Completion)
- Benachrichtigungs-Digest per E-Mail (konfigurierbar)
- E-Mails: Kontobestätigung, Passwort-Reset, Anfrage-Annahme

### Sicherheit & Infrastruktur
- JWT-Sessions in Redis (kein DB-Session-Store)
- Rollenbasierte Zugriffskontrolle: CUSTOMER / STAFF / ADMIN
- Rate-Limiting für Auth-Endpunkte
- Auto-Logout bei abgelaufenem Token (401-Interceptor)

## Geplante Erweiterungen

- 🕒 Timeline mit der Zeit, die ein Auftrag in jedem Status verbracht hat
- 📦 Warteschlange mit geschätzter Restzeit auf Basis der aktuellen Auslastung
- 📊 Statistik- und Graph-Ansichten für Gerätetypen, Reparaturarten und Team-Auswertung

## Ablauf einer Reparaturanfrage

Siehe [Detaillierter Ablauf](docs/repair-flow.md) für den vollständigen End-to-End-Prozess.

## Screenshots

### Staff-Sicht: Reparaturanfrage

![Staff Reparaturanfrage](public/docs/repair-request.png)

### Kunden-Sicht: Chat

![Kunden Chat](public/docs/chat.png)

### Kunden-Sicht: Reparatur-Graph

![Reparatur Graph](public/docs/graph.png)

## Entwicklung

### Voraussetzungen

- Bun
- Docker und Docker Compose (bevorzugter lokaler Workflow)

### Start mit Docker (empfohlen)

```bash
bun dev
```

### Lokaler Start (ohne Docker, eigene Postgres/Redis nötig)

```bash
bun install
bun dev:local
```

### Nützliche Befehle

```bash
bun build          # Production-Build
bun lint           # Style- und ESLint-Prüfung
bun lint:fix       # Automatische Korrekturen
bun db-push        # Prisma-Schema ohne Migration anwenden (dev)
bun db-deploy      # Ausstehende Migrationen anwenden (prod-sicher)
bun db-seed        # Seed-Daten einspielen
bun db-reset       # Datenbank komplett zurücksetzen (destruktiv)
npx tsc --noEmit   # TypeScript-Prüfung ohne Build
```

## Tech-Stack

| Schicht | Technologie |
|---|---|
| Framework | Nuxt 4 (Full-Stack) |
| Frontend | Vue 3, Pinia, SCSS |
| ORM | Prisma 7, PostgreSQL |
| Auth | JWT + Redis |
| Echtzeit | Socket.IO |
| Mail | Nodemailer |
| Runtime | Bun / Node.js |
| Container | Docker Compose |
