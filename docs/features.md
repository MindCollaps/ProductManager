# Funktionsübersicht

Dieses Dokument beschreibt den aktuellen Implementierungsstand aller Module.

---

## Authentifizierung

| Funktion | Status |
|---|---|
| Registrierung mit E-Mail + Passwort | ✅ |
| E-Mail-Verifizierung | ✅ |
| Login / Logout | ✅ |
| Passwort-Reset per E-Mail | ✅ |
| JWT-Sessions in Redis | ✅ |
| Auto-Logout bei abgelaufenem Token | ✅ |
| Rate-Limiting für Auth-Endpunkte | ✅ |
| Rollenmodell: CUSTOMER / STAFF / ADMIN | ✅ |

---

## Kundenbereich (`/request`)

| Funktion | Status |
|---|---|
| Neue Reparaturanfrage erstellen | ✅ |
| Eigene Anfragen auflisten | ✅ |
| Anfragestatus einsehen | ✅ |
| Reparatur-Graph (Arbeitsschritte, lesend) | ✅ |
| Reparaturwert vs. Neukaufwert (Savings-Tile) | ✅ |
| Echtzeit-Chat pro Anfrage | ✅ |
| In-App-Benachrichtigungen mit Badge | ✅ |
| Benachrichtigungen als gelesen markieren / löschen | ✅ |

---

## Staff-Bereich (`/staff`)

### Anfragen
| Funktion | Status |
|---|---|
| Alle offenen Anfragen einsehen | ✅ |
| Anfrage annehmen / ablehnen | ✅ |
| Anfrage abschließen / stornieren | ✅ |
| Anfrage archivieren | ✅ |
| Mitarbeiter einer Anfrage zuweisen | ✅ |
| Verlauf / Archiv abrufen | ✅ |

### Arbeitsschritte (Work Items)
| Funktion | Status |
|---|---|
| Schritte anlegen, bearbeiten, löschen | ✅ |
| Status: PENDING / IN_PROGRESS / DONE | ✅ |
| Mitarbeiter-Zuweisung pro Schritt | ✅ |
| Standardschritte zurücksetzen | ✅ |
| Automatische Anfragestatus-Synchronisation | ✅ |

### Ersatzteile
| Funktion | Status |
|---|---|
| Teil aus Katalog zu Schritt hinzufügen | ✅ |
| Menge, Lieferant, geschätzte Kosten | ✅ |
| Retail-Preis als Vorschlagswert beim Hinzufügen | ✅ |
| Statusverlauf: DRAFT → ORDERED → SHIPPED → RECEIVED → INSTALLED | ✅ |
| Löschen eines Schritts entfernt zugehörige Teile (Cascade) | ✅ |

### Reparaturgerät
| Funktion | Status |
|---|---|
| Gerät aus Katalog auswählen und anlegen | ✅ |
| Anzeigename, Seriennummer, Notizen | ✅ |
| Reparaturstatus-Phasen setzen | ✅ |

### Reparaturstatus-Phasen
RECEIVED → IN_DIAGNOSIS → WAITING_FOR_PARTS → IN_REPAIR → IN_QA → IN_OUTGOING → ON_THE_WAY_TO_CUSTOMER → DELIVERED → ARCHIVED

### Kommunikation & Auswertung
| Funktion | Status |
|---|---|
| Chat mit Kunden | ✅ |
| Reparaturwert-Tile (Kosten vs. Neukauf) | ✅ |

---

## Admin-Bereich (`/admin`)

| Funktion | Status |
|---|---|
| Gerätekatalog (CRUD) | ✅ |
| Gerätekategorien (CRUD) | ✅ |
| Marken (CRUD) | ✅ |
| Arbeitsschritttypen (CRUD) | ✅ |
| Ersatzteilkatalog (CRUD) | ✅ |
| Systemkonfiguration (Stundensatz) | ✅ |

---

## Echtzeit (Socket.IO)

| Funktion | Status |
|---|---|
| Chat-Nachrichten in Echtzeit | ✅ |
| Benachrichtigungs-Badge in Echtzeit | ✅ |
| Benachrichtigungs-Digest per E-Mail | ✅ |

---

## Reparaturwert-Berechnung

Die Savings-Tile zeigt zwei Werte nebeneinander:
- **Reparaturwert** (grün): Arbeitskosten (Minuten × Stundensatz) + Teilekosten
- **Neukaufwert** (gelb): Kaufpreis eines neuen Geräts laut Katalog

Wird auf der Kunden-Anfragenseite und der Staff-Anfragendetailseite angezeigt.

---

## Geplante Erweiterungen

- 🕒 Timeline mit Verweildauer pro Status
- 📦 Queue mit geschätzter Restzeit
- 📊 Statistiken: Gerätetypen, häufige Defekte, Team-Auswertung
