#!/usr/bin/env python3
"""E2E checklist for local Supabase dev (develop branch)."""
import json
import sys
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:54321"
WEB = "http://127.0.0.1:8080"
ANON = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9."
    "CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
)

results = []


def fetch(method, url, body=None, token=None, headers=None, raw_body=None):
    h = {"apikey": ANON}
    if body is not None or (body is None and raw_body is None and method not in ("GET", "HEAD")):
        h["Content-Type"] = "application/json"
    if token:
        h["Authorization"] = f"Bearer {token}"
    if headers:
        h.update(headers)
    data = raw_body if raw_body is not None else (json.dumps(body).encode() if body is not None else None)
    r = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(r, timeout=15) as resp:
            raw = resp.read()
            if method == "HEAD":
                return resp.status, None
            text = raw.decode()
            try:
                return resp.status, json.loads(text)
            except json.JSONDecodeError:
                return resp.status, text
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"raw": raw}
        return e.code, payload


def req(method, url, body=None, token=None, headers=None):
    return fetch(method, url, body=body, token=token, headers=headers)


def check(name, ok, detail=""):
    results.append({"name": name, "ok": ok, "detail": detail})
    mark = "PASS" if ok else "FAIL"
    print(f"[{mark}] {name}" + (f" — {detail}" if detail else ""))


def main():
    # 0. HTTP server + config.local.js
    code, _ = req("HEAD", f"{WEB}/config.local.js")
    check("HTTP server + config.local.js", code == 200, f"HEAD config.local.js → {code}")

    code, html = req("GET", f"{WEB}/index.html")
    has_loader = isinstance(html, str) and "config-loader.js" in html and "dev-auth.js" in html
    check("index.html loads config-loader + dev-auth", code == 200 and has_loader)

    # 1. Auth — dev login (no magic link)
    code, auth = req(
        "POST",
        f"{BASE}/auth/v1/token?grant_type=password",
        {"email": "dev@local.test", "password": "dev123"},
    )
    token = auth.get("access_token") if isinstance(auth, dict) else None
    check("Dev auto-login API (password grant)", code == 200 and bool(token), f"HTTP {code}")

    if not token:
        print("\n=== BLOCKED: cannot continue without token ===")
        sys.exit(1)

    # 2. Org switcher data — orgs semeadas visíveis ao superadmin.
    # Subconjunto, não igualdade: o seed cresce (refugio, reconciliador, …)
    # e orgs de teste ficam na BD entre corridas.
    code, orgs = req(
        "GET", f"{BASE}/rest/v1/orgs?select=id,slug,name,catalog_id&order=slug", token=token
    )
    slugs = sorted(o["slug"] for o in orgs) if isinstance(orgs, list) else []
    esperadas = {"iar", "igreja-teste"}
    check(
        "Org switcher data (orgs semeadas visíveis)",
        code == 200 and esperadas.issubset(set(slugs)),
        str(slugs) if code == 200 else str(orgs),
    )

    # 2b. catalog_id escolhe o catálogo de templates (core/org-skin.js:marcaIdForCatalog)
    catalogos = {o["slug"]: o.get("catalog_id") for o in orgs} if isinstance(orgs, list) else {}
    check(
        "catalog_id por org",
        code == 200
        and catalogos.get("iar") == "church-v1"
        and (
            "reconciliador" not in catalogos
            or catalogos["reconciliador"] == "reconciliador-v1"
        ),
        str(catalogos),
    )

    # 3. Admin CRUD — upsert test org
    test_slug = "e2e-test-org"
    code, saved = req(
        "POST",
        f"{BASE}/rest/v1/orgs?on_conflict=slug",
        {"slug": test_slug, "name": "E2E Test Org", "handle": "@e2e.test"},
        token=token,
        headers={"Prefer": "resolution=merge-duplicates,return=representation"},
    )
    org_id = saved[0]["id"] if isinstance(saved, list) and saved else None
    check("Admin CRUD — upsert org", code in (200, 201) and bool(org_id), f"HTTP {code}")

    if org_id:
        code, updated = req(
            "PATCH",
            f"{BASE}/rest/v1/orgs?id=eq.{org_id}",
            {"name": "E2E Test Org Updated"},
            token=token,
            headers={"Prefer": "return=representation"},
        )
        name_ok = (
            isinstance(updated, list)
            and updated
            and updated[0].get("name") == "E2E Test Org Updated"
        )
        check("Admin CRUD — update org", code == 200 and name_ok, f"HTTP {code}")

        # Logo upload (minimal 1x1 PNG)
        import base64

        png = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
        )
        path = f"{org_id}/logo.png"
        code, storage = fetch(
            "POST",
            f"{BASE}/storage/v1/object/org-logos/{path}",
            token=token,
            headers={"Content-Type": "image/png", "x-upsert": "true"},
            raw_body=png,
        )
        storage_ok = code in (200, 201)
        check("Admin CRUD — logo upload", storage_ok, "" if storage_ok else str(storage))

        req("DELETE", f"{BASE}/rest/v1/orgs?id=eq.{org_id}", token=token)

    # 4. Invite link format
    iar_id = next((o["id"] for o in orgs if o["slug"] == "iar"), None) if isinstance(orgs, list) else None
    if iar_id:
        code, inv = req(
            "POST",
            f"{BASE}/rest/v1/invites",
            {"org_id": iar_id, "email": "convidado@local.test"},
            token=token,
            headers={"Prefer": "return=representation"},
        )
        token_val = inv[0]["token"] if isinstance(inv, list) and inv else None
        invite_url = f"{WEB}/index.html?invite={token_val}" if token_val else ""
        link_ok = (
            code in (200, 201)
            and token_val
            and invite_url.startswith(f"{WEB}/index.html?invite=")
        )
        check("Invite link format", link_ok, invite_url[:80] if link_ok else str(inv))
    else:
        check("Invite link format", False, "iar org not found")

    # 5. Canvas page loads SaaS scripts
    code, canvas_html = req("GET", f"{WEB}/marcas/iar/canvas.html")
    canvas_ok = (
        code == 200
        and isinstance(canvas_html, str)
        and "config-loader.js" in canvas_html
        and "dev-auth.js" in canvas_html
        and "SAAS_MODE" in canvas_html
        and "auth-gate.jsx" in canvas_html
    )
    check("Canvas SaaS boot (config + auth-gate)", canvas_ok)

    # 6. Org asset isolation
    code, assets_probe = req("GET", f"{BASE}/rest/v1/org_assets?select=id&limit=0", token=token)
    check("org_assets table reachable", code == 200, f"HTTP {code}")

    iar_id = next((o["id"] for o in orgs if o["slug"] == "iar"), None) if isinstance(orgs, list) else None
    teste_id = next((o["id"] for o in orgs if o["slug"] == "igreja-teste"), None) if isinstance(orgs, list) else None

    gallery_id = None
    if iar_id:
        code, gallery = req(
            "POST",
            f"{BASE}/rest/v1/org_assets",
            {
                "org_id": iar_id,
                "kind": "gallery",
                "storage_path": f"{iar_id}/gallery/e2e-test.png",
                "url": f"{BASE}/storage/v1/object/public/org-assets/{iar_id}/gallery/e2e-test.png",
                "label": "E2E gallery",
            },
            token=token,
            headers={"Prefer": "return=representation"},
        )
        gallery_id = gallery[0]["id"] if isinstance(gallery, list) and gallery else None
        check("org_assets gallery insert (superadmin)", code in (200, 201) and bool(gallery_id), f"HTTP {code}")

        if teste_id and gallery_id:
            code, isolated = req(
                "GET",
                f"{BASE}/rest/v1/org_assets?org_id=eq.{teste_id}&id=eq.{gallery_id}&select=id",
                token=token,
            )
            isolated_ok = code == 200 and isinstance(isolated, list) and len(isolated) == 0
            check("org_assets cross-org isolation", isolated_ok, f"HTTP {code}, rows={len(isolated) if isinstance(isolated, list) else '?'}")

        req("DELETE", f"{BASE}/rest/v1/org_assets?id=eq.{gallery_id}", token=token)
    else:
        check("org_assets gallery insert (superadmin)", False, "iar org not found")
        check("org_assets cross-org isolation", False, "iar org not found")

    if iar_id and teste_id:
        req(
            "PATCH",
            f"{BASE}/rest/v1/orgs?id=eq.{iar_id}",
            {"theme": {"fontHeading": "Fraunces", "fontBody": "Inter"}},
            token=token,
        )
        req(
            "PATCH",
            f"{BASE}/rest/v1/orgs?id=eq.{teste_id}",
            {"theme": {"fontHeading": "Playfair Display", "fontBody": "Lato"}},
            token=token,
        )
        code, themed = req(
            "GET",
            f"{BASE}/rest/v1/orgs?select=slug,theme&slug=in.(iar,igreja-teste)",
            token=token,
        )
        by_slug = {o["slug"]: o.get("theme") or {} for o in themed} if isinstance(themed, list) else {}
        fonts_ok = (
            code == 200
            and by_slug.get("iar", {}).get("fontHeading") == "Fraunces"
            and by_slug.get("iar", {}).get("fontBody") == "Inter"
            and by_slug.get("igreja-teste", {}).get("fontHeading") == "Playfair Display"
            and by_slug.get("igreja-teste", {}).get("fontBody") == "Lato"
        )
        check("Per-org theme fonts in API", fonts_ok, str(by_slug) if code == 200 else str(themed))
    else:
        check("Per-org theme fonts in API", False, "orgs not found")

    # Summary
    passed = sum(1 for r in results if r["ok"])
    total = len(results)
    print(f"\n=== {passed}/{total} passed ===")
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
