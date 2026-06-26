# Ablauf einer Reparaturanfrage

Dieser Artikel beschreibt den aktuell implementierten End-to-End-Prozess.

---

## 1. Kundenkonto anlegen

Der Kunde registriert sich mit E-Mail und Passwort. Nach der Registrierung wird eine Bestätigungs-E-Mail verschickt. Erst nach der Verifizierung ist das Konto vollständig aktiv.

## 2. Reparaturanfrage erstellen

Über `/request/new` erfasst der Kunde:

- Betreff
- Gerätename, Marke, Modell
- Problembeschreibung
- Was bereits versucht wurde
- Vermutete Ursache
- Sonstige Hinweise

Die Anfrage landet im Status **WAITING_FOR_REVIEW**.

## 3. Interne Sichtung (Staff)

Das Staff-Team sieht alle offenen Anfragen unter `/staff/request`. Über den Anfrage-Chat können Rückfragen gestellt werden. Sobald alle nötigen Infos vorliegen, wird die Anfrage angenommen (**ACCEPTED**).

Der Kunde erhält eine Benachrichtigung und eine E-Mail mit den Versand- bzw. Abgabeinformationen.

## 4. Mitarbeiter-Zuweisung

Ein Mitarbeiter wird der Anfrage zugewiesen. Die Zuweisung ist jederzeit änderbar und dient der internen Nachvollziehbarkeit.

## 5. Reparaturgerät anlegen

Nachdem das Gerät eingegangen ist, legt das Staff-Team ein Reparaturgerät an (Gerät aus Katalog auswählen, Seriennummer und Anzeigename vergeben). Ab diesem Punkt sind die Reparaturstatus-Phasen verfügbar.

## 6. Reparaturstatus-Phasen

Das Team setzt den physischen Gerätestatus manuell:

| Phase | Bedeutung |
|---|---|
| RECEIVED | Gerät ist eingegangen |
| IN_DIAGNOSIS | Sichtung und Fehlerdiagnose |
| WAITING_FOR_PARTS | Warte auf Ersatzteile |
| IN_REPAIR | Aktive Reparatur |
| IN_QA | Qualitätsprüfung |
| IN_OUTGOING | Im Warenausgang |
| ON_THE_WAY_TO_CUSTOMER | Unterwegs zum Kunden |
| DELIVERED | Zugestellt |
| ARCHIVED | Archiviert |

## 7. Arbeitsschritte (Work Items)

Pro Anfrage werden Arbeitsschritte im Reparatur-Graph dokumentiert:

- Jeder Schritt hat einen Typ (z. B. Diagnose, Löten, Test), einen Status und optional einen zugewiesenen Mitarbeiter.
- Status: **PENDING → IN_PROGRESS → DONE**
- Sobald alle Schritte auf DONE stehen, kann die Anfrage als abgeschlossen markiert werden.
- Der Anfragestatus synchronisiert sich automatisch mit dem Fortschritt der Schritte.

## 8. Ersatzteil-Bestellungen

Benötigte Teile werden direkt an einen Arbeitsschritt gehängt:

1. Teil aus dem Ersatzteilkatalog auswählen
2. Menge, Lieferant und geschätzte Kosten angeben (Retail-Preis wird als Vorschlag vorausgefüllt)
3. Status der Bestellung mitverfolgen: DRAFT → ORDERED → SHIPPED → RECEIVED → INSTALLED / CANCELLED

Wird ein Arbeitsschritt gelöscht, werden die zugehörigen Teilebestellungen automatisch mitgelöscht.

## 9. Reparaturwert

Auf der Detailseite (Kunden- und Staff-Sicht) wird der Reparaturwert angezeigt:

- **Reparaturwert** (grün): Arbeitsstunden × Stundensatz + Teilekosten — was die Reparatur kosten würde
- **Neukaufwert** (gelb): Katalogseitiger Kaufpreis eines neuen Geräts

Da die Reparaturen kostenlos sind, zeigt die Tile den vollen Wert der Dienstleistung.

## 10. Abschluss und Archiv

Sobald alle Schritte erledigt sind, kann das Team die Anfrage als **COMPLETED** markieren. Anschließend lässt sie sich archivieren (**ARCHIVED**). Abgeschlossene Aufträge sind im Verlauf unter `/staff/history` weiterhin einsehbar.
