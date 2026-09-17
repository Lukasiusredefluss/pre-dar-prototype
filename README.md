# PRE DAR

Ein mobiler UX-Prototyp für absurde Freundeswetten:

- **PRE** – Vorhersagen über das, was passieren wird
- **DAR** – Aufgaben und Konsequenzen, die jemand annehmen muss

## Testumfang

Der Prototyp enthält eine Beispielgruppe, aktive Spiele, Abstimmungen, das Erstellen und Auflösen eigener Spiele, eine Chronik und einen teilbaren Einladungslink. Es gibt bewusst noch kein Backend und keine Accounts. Änderungen landen nur im `localStorage` des jeweiligen Browsers und werden nicht zwischen Testern synchronisiert.

## Lokal starten

Die App ist statisch und benötigt keinen Build-Schritt:

```bash
python3 -m http.server 8080
```

Danach `http://localhost:8080` öffnen.

## GitHub Pages

Der Workflow in `.github/workflows/pages.yml` veröffentlicht den Inhalt automatisch über GitHub Pages, sobald Pages in den Repository-Einstellungen auf **GitHub Actions** gestellt ist.
