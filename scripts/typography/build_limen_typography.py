#!/usr/bin/env python3
"""Construye el archivo maestro y el paquete web tipográfico de LIMEN.

Requiere Python 3.11+, fontTools y Brotli. El origen esperado es una copia
parcial del repositorio oficial google/fonts con las familias seleccionadas.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import shutil
import subprocess
from collections import Counter
from pathlib import Path

from fontTools.ttLib import TTFont


REQUESTED = [
    line.strip()
    for filename in ("selection.txt", "recommended-additions.txt")
    for line in (Path(__file__).parent / filename).read_text(encoding="utf-8").splitlines()
    if line.strip()
]

ALIASES = {
    "Londrina Outlet": ("Londrina Outline", "ofl/londrinaoutline"),
    "Playwrite Cuba": ("Playwrite CU", "ofl/playwritecu"),
    "Playwrite India": ("Playwrite IN", "ofl/playwritein"),
}

RECOMMENDED = {
    line.strip()
    for line in (Path(__file__).parent / "recommended-additions.txt").read_text(encoding="utf-8").splitlines()
    if line.strip()
}

CORE = {
    "Abril Fatface", "Alex Brush", "Allura", "Bad Script", "Bebas Neue",
    "Beth Ellen", "Bodoni Moda", "Bona Nova", "Bonheur Royale", "Calistoga",
    "Carattere", "Caveat", "Cormorant Garamond", "DM Serif Display",
    "Euphoria Script", "Fraunces", "Gilda Display", "Instrument Sans", "Inter",
    "Josefin Sans", "Jost", "Kalam", "League Spartan", "Libre Caslon Display",
    "Lora", "Manrope", "Mea Culpa", "Montserrat", "Nunito", "Ovo", "Pinyon Script",
    "Playfair Display", "Poppins", "Prata", "Questrial", "Quicksand", "Raleway",
    "Sacramento", "WindSong", "Cinzel",
}

THEMATIC = {
    "Amatic SC", "Architects Daughter", "Atomic Age", "Bangers", "Bitcount Ink",
    "Boogaloo", "Bubblegum Sans", "Chicle", "Cinzel Decorative", "Contrail One",
    "Courgette", "Dancing Script", "DynaPuff", "Edu TAS Beginner", "Finger Paint",
    "Francois One", "Germania One", "Gloria Hallelujah", "Great Vibes", "Handlee",
    "Kaushan Script", "La Belle Aurore", "Lobster", "Lobster Two", "Londrina Outline",
    "Londrina Solid", "Macondo", "Macondo Swash Caps", "Marck Script", "Norican",
    "Oleo Script Swash Caps", "Pacifico", "Permanent Marker", "Playpen Sans",
    "Playwrite CU", "Playwrite IN", "Protest Revolution", "Satisfy", "Shadows Into Light",
    "Skranji", "Sour Gummy", "Special Gothic", "Style Script", "Vina Sans",
}

CATEGORIES = {
    "editorial-elegante": {
        "Abril Fatface", "Bodoni Moda", "Bona Nova", "Cormorant Garamond", "Cinzel",
        "Cinzel Decorative", "DM Serif Display", "Fraunces", "Gilda Display",
        "Libre Caslon Display", "Lora", "Ovo", "Playfair Display", "Prata",
    },
    "moderna-funcional": {
        "Basic", "Belanosima", "Instrument Sans", "Inter", "Josefin Sans", "Jost", "Lato",
        "League Spartan", "Manrope", "Montserrat", "Nobile", "Nunito", "Open Sans",
        "Poppins", "Questrial", "Quicksand", "Raleway", "Roboto",
    },
    "caligrafica-romantica": {
        "Alex Brush", "Allison", "Allura", "Bilbo Swash Caps", "Birthstone",
        "Bonheur Royale", "Carattere", "Dancing Script", "Delius Swash Caps",
        "Euphoria Script", "Great Vibes", "Italianno", "Lobster", "Lobster Two",
        "Mea Culpa", "Montez", "Monsieur La Doulaise", "Norican", "Oleo Script Swash Caps",
        "Pacifico", "Parisienne", "Petit Formal Script", "Pinyon Script", "Playball",
        "Qwitcher Grypen", "Rouge Script", "Sacramento", "Sarina", "Satisfy", "Sofia",
        "Style Script", "Tangerine", "WindSong", "Zeyada",
    },
    "manuscrita-natural": {
        "Amatic SC", "Architects Daughter", "Bad Script", "Beth Ellen", "Caveat",
        "Crafty Girls", "Edu TAS Beginner", "Gloria Hallelujah", "Handlee",
        "Just Another Hand", "Kalam", "La Belle Aurore", "Over The Rainbow",
        "Playwrite CU", "Playwrite IN", "Shadows Into Light",
    },
    "fiesta-juvenil": {
        "Autour One", "Bangers", "Bigshot One", "Boogaloo", "Bubblegum Sans", "Calistoga",
        "Chicle", "DynaPuff", "Finger Paint", "Mouse Memoirs", "Nova Round",
        "Playpen Sans", "Sour Gummy",
    },
    "urbana-impacto": {
        "Atomic Age", "Bebas Neue", "Bitcount Ink", "Contrail One", "Francois One",
        "Germania One", "Londrina Outline", "Londrina Solid", "Permanent Marker",
        "Protest Revolution", "Risque", "Skranji", "Special Gothic", "Vina Sans",
    },
    "garden-artesanal": {
        "Courgette", "Kaushan Script", "Macondo", "Macondo Swash Caps", "Mansalva",
        "Marck Script", "Redressed",
    },
    "texto-clasico": {
        "Amaranth", "Cambo", "Domine", "Headland One", "Merriweather", "Overlock",
    },
}

COMBINATIONS = [
    ("Noche plateada", "Cormorant Garamond", "Prata", "Instrument Sans"),
    ("Gala moderna", "Bodoni Moda", "Raleway", "Montserrat"),
    ("Romántica clásica", "Pinyon Script", "Playfair Display", "Jost"),
    ("Garden antigua", "WindSong", "Fraunces", "Quicksand"),
    ("Editorial silenciosa", "Mea Culpa", "Ovo", "Questrial"),
    ("Boda clásica", "Alex Brush", "Bona Nova", "Montserrat"),
    ("Quince moderno", "Euphoria Script", "DM Serif Display", "Poppins"),
    ("Retro sofisticada", "Sacramento", "Calistoga", "Jost"),
    ("Fiesta nocturna", "Bebas Neue", "Francois One", "Inter"),
    ("Urbana", "Permanent Marker", "Londrina Solid", "Instrument Sans"),
    ("Fantasía ceremonial", "Cinzel Decorative", "Cormorant Garamond", "Raleway"),
    ("Cercana artesanal", "Beth Ellen", "Lora", "Nunito"),
]

SPANISH_REQUIRED = set("ÁÉÍÓÚÜÑáéíóúüñ¡¿0123456789")
UNICODES = "U+0000-00FF,U+0100-024F,U+1E00-1EFF,U+2000-206F,U+20AC"


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def contains_name(names: set[str], value: str) -> bool:
    value_slug = slug(value)
    return any(slug(name) == value_slug for name in names)


def parse_metadata(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    def first(pattern: str, default: str = "") -> str:
        match = re.search(pattern, text, re.MULTILINE)
        return match.group(1) if match else default
    return {
        "name": first(r'^name: "([^"]+)"'),
        "designer": first(r'^designer: "([^"]+)"'),
        "license": first(r'^license: "([^"]+)"'),
        "google_category": first(r'^category: "([^"]+)"'),
        "date_added": first(r'^date_added: "([^"]+)"'),
        "subsets": re.findall(r'^subsets: "([^"]+)"', text, re.MULTILINE),
        "axes": re.findall(r'axes \{\s+tag: "([^"]+)"', text, re.MULTILINE),
    }


def find_sources(source_root: Path) -> dict[str, Path]:
    found = {}
    for metadata in source_root.glob("*/*/METADATA.pb"):
        found[slug(metadata.parent.name)] = metadata.parent
    return found


def tier(name: str) -> str:
    if contains_name(CORE, name):
        return "principal"
    if contains_name(THEMATIC, name):
        return "tematica"
    return "experimental"


def category(name: str) -> str:
    matches = [label for label, names in CATEGORIES.items() if contains_name(names, name)]
    if len(matches) != 1:
        raise ValueError(f"{name}: se esperaba una categoría LIMEN y se hallaron {matches}")
    return matches[0]


def roles(label: str) -> str:
    return {
        "editorial-elegante": "protagonista|titulo|narrativa",
        "moderna-funcional": "titulo|narrativa|funcional",
        "caligrafica-romantica": "protagonista|acento",
        "manuscrita-natural": "protagonista|titulo|acento",
        "fiesta-juvenil": "protagonista|titulo",
        "urbana-impacto": "protagonista|titulo",
        "garden-artesanal": "protagonista|titulo|acento",
        "texto-clasico": "titulo|narrativa",
    }[label]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def copy_text_normalized(source: Path, destination: Path) -> None:
    """Copia texto de terceros con finales LF y sin espacios terminales."""
    text = source.read_text(encoding="utf-8")
    normalized = "\n".join(line.rstrip() for line in text.splitlines()) + "\n"
    destination.write_text(normalized, encoding="utf-8")


def font_details(path: Path) -> dict:
    font = TTFont(path, lazy=False)
    cmap = set()
    for table in font["cmap"].tables:
        cmap.update(table.cmap)
    chars = {chr(codepoint) for codepoint in cmap if codepoint <= 0x10FFFF}
    axes = {}
    if "fvar" in font:
        for axis in font["fvar"].axes:
            axes[axis.axisTag] = [axis.minValue, axis.maxValue]
    weight = int(font["OS/2"].usWeightClass) if "OS/2" in font else 400
    missing = "".join(sorted(SPANISH_REQUIRED - chars))
    font.close()
    return {"axes": axes, "weight": weight, "spanish_missing": missing}


def build(source_root: Path, output_root: Path) -> None:
    if output_root.exists():
        shutil.rmtree(output_root)
    master_root = output_root / "fuentes_maestras"
    web_root = output_root / "fuentes_web"
    catalog_root = output_root / "catalogo"
    scripts_root = output_root / "scripts"
    for directory in (master_root, web_root, catalog_root, scripts_root):
        directory.mkdir(parents=True, exist_ok=True)

    sources = find_sources(source_root)
    rows = []
    global_css = ["/* Biblioteca tipográfica LIMEN v1 · cargar solo familias utilizadas */", ""]
    corrections = []

    for requested in REQUESTED:
        expected_name, explicit_path = ALIASES.get(requested, (requested, ""))
        source_dir = source_root / explicit_path if explicit_path else sources.get(slug(requested))
        if not source_dir or not source_dir.exists():
            raise FileNotFoundError(f"No se halló la fuente oficial para {requested}")
        metadata = parse_metadata(source_dir / "METADATA.pb")
        official = metadata["name"]
        if slug(official) != slug(expected_name):
            raise ValueError(f"Nombre inesperado: {requested} -> {official} (esperado {expected_name})")
        if requested != official:
            corrections.append({"busqueda_original": requested, "nombre_oficial": official})

        font_files = sorted(source_dir.glob("*.ttf"))
        if not font_files:
            raise FileNotFoundError(f"{official}: no hay archivos TTF")
        preliminary_missing = set()
        for source_font in font_files:
            preliminary_missing.update(font_details(source_font)["spanish_missing"])

        current_tier = "experimental" if preliminary_missing else tier(official)
        current_category = category(official)
        family_slug = slug(official)
        master_family = master_root / current_tier / family_slug
        web_family = web_root / current_tier / family_slug
        master_family.mkdir(parents=True, exist_ok=True)
        web_family.mkdir(parents=True, exist_ok=True)

        license_files = [p for p in source_dir.iterdir() if p.name in {"OFL.txt", "LICENSE.txt", "UFL.txt"}]
        if not license_files:
            raise FileNotFoundError(f"{official}: falta archivo de licencia")
        for license_file in license_files:
            copy_text_normalized(license_file, master_family / license_file.name)
            copy_text_normalized(license_file, web_family / license_file.name)
        shutil.copy2(source_dir / "METADATA.pb", master_family / "METADATA.pb")

        source_missing = set()
        web_missing = set()
        web_assets = []
        is_variable = False
        axes_seen = set()
        family_css = [f"/* {official} */"]

        for source_font in font_files:
            shutil.copy2(source_font, master_family / source_font.name)
            source_info = font_details(source_font)
            source_missing.update(source_info["spanish_missing"])
            axes_seen.update(source_info["axes"])
            is_variable = is_variable or bool(source_info["axes"])

            output_name = re.sub(r"[^A-Za-z0-9._-]", "-", source_font.stem) + ".woff2"
            output_font = web_family / output_name
            subprocess.run([
                "pyftsubset", str(source_font), f"--output-file={output_font}", "--flavor=woff2",
                f"--unicodes={UNICODES}", "--layout-features=*", "--glyph-names",
                "--symbol-cmap", "--legacy-cmap", "--notdef-glyph", "--notdef-outline",
                "--recommended-glyphs", "--name-legacy", "--drop-tables+=DSIG",
            ], check=True, capture_output=True, text=True)
            output_info = font_details(output_font)
            web_missing.update(output_info["spanish_missing"])

            italic = "italic" in source_font.name.lower()
            weight_value = source_info["weight"]
            if "wght" in source_info["axes"]:
                minimum, maximum = source_info["axes"]["wght"]
                css_weight = f"{int(minimum)} {int(maximum)}"
            else:
                css_weight = str(weight_value)
            global_relative_url = f"./{current_tier}/{family_slug}/{output_name}"
            global_block = [
                "@font-face {",
                f"  font-family: '{official}';",
                f"  src: url('{global_relative_url}') format('woff2');",
                f"  font-style: {'italic' if italic else 'normal'};",
                f"  font-weight: {css_weight};",
                "  font-display: swap;",
                "}",
                "",
            ]
            family_block = [
                "@font-face {",
                f"  font-family: '{official}';",
                f"  src: url('./{output_name}') format('woff2');",
                f"  font-style: {'italic' if italic else 'normal'};",
                f"  font-weight: {css_weight};",
                "  font-display: swap;",
                "}",
                "",
            ]
            family_css.extend(family_block)
            global_css.extend(global_block)
            web_assets.append({
                "filename": output_name,
                "bytes": output_font.stat().st_size,
                "sha256": sha256(output_font),
                "style": "italic" if italic else "normal",
                "weight": css_weight,
            })

        spanish_missing = "".join(sorted(source_missing | web_missing))
        (web_family / "font-face.css").write_text("\n".join(family_css), encoding="utf-8")
        rows.append({
            "requested_name": requested,
            "official_name": official,
            "slug": family_slug,
            "tier": current_tier,
            "limen_category": current_category,
            "allowed_roles": roles(current_category),
            "recommended_addition": contains_name(RECOMMENDED, official),
            "google_category": metadata["google_category"],
            "license": metadata["license"],
            "designer": metadata["designer"],
            "date_added": metadata["date_added"],
            "latin_ext": "latin-ext" in metadata["subsets"],
            "spanish_verified": not spanish_missing,
            "spanish_missing": spanish_missing,
            "studio_enabled_initial": current_tier == "principal" and not spanish_missing,
            "variable": is_variable,
            "axes": sorted(axes_seen),
            "master_files": [p.name for p in font_files],
            "web_assets": web_assets,
            "source_path": str(source_dir.relative_to(source_root)),
        })

    (web_root / "fonts.css").write_text("\n".join(global_css), encoding="utf-8")
    rows.sort(key=lambda row: (row["tier"], row["limen_category"], row["official_name"]))
    (catalog_root / "inventario.json").write_text(
        json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    csv_fields = [
        "requested_name", "official_name", "tier", "limen_category", "allowed_roles",
        "recommended_addition", "google_category", "license", "designer", "latin_ext",
        "spanish_verified", "spanish_missing", "studio_enabled_initial", "variable", "axes", "source_path",
    ]
    with (catalog_root / "inventario.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=csv_fields, lineterminator="\n")
        writer.writeheader()
        for row in rows:
            writer.writerow({
                field: "|".join(row["axes"]) if field == "axes" else row[field]
                for field in csv_fields
            })
    with (catalog_root / "combinaciones_iniciales.csv").open(
        "w", encoding="utf-8-sig", newline=""
    ) as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(["caracter", "protagonista", "editorial", "funcional"])
        writer.writerows(COMBINATIONS)
    (catalog_root / "correcciones_de_nombres.json").write_text(
        json.dumps(corrections, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    tier_counts = Counter(row["tier"] for row in rows)
    category_counts = Counter(row["limen_category"] for row in rows)
    license_counts = Counter(row["license"] for row in rows)
    summary = [
        "# Inventario tipográfico LIMEN v1",
        "",
        f"Familias verificadas: **{len(rows)}**.",
        "",
        "## Niveles",
        "",
        *[f"- {name}: {tier_counts[name]}" for name in ("principal", "tematica", "experimental")],
        "",
        "## Categorías LIMEN",
        "",
        *[f"- {name}: {count}" for name, count in sorted(category_counts.items())],
        "",
        "## Licencias registradas",
        "",
        *[f"- {name}: {count}" for name, count in sorted(license_counts.items())],
        "",
        "Las 122 familias fueron comprobadas para los caracteres esenciales del español.",
        "Las que no superaron la comprobación permanecen en reserva experimental y no deben habilitarse en Studio.",
        "La disponibilidad en este archivo no implica que todas deban aparecer inicialmente en Studio.",
    ]
    (catalog_root / "RESUMEN.md").write_text("\n".join(summary) + "\n", encoding="utf-8")

    source_commit = subprocess.check_output(
        ["git", "-C", str(source_root), "rev-parse", "HEAD"], text=True
    ).strip()
    (output_root / "ORIGEN.txt").write_text(
        "Repositorio: https://github.com/google/fonts\n"
        f"Commit: {source_commit}\n"
        "Los archivos se redistribuyen conforme a la licencia incluida en cada familia.\n",
        encoding="utf-8",
    )
    readme = f"""# Biblioteca tipográfica LIMEN v1

Este paquete contiene {len(rows)} familias verificadas desde el repositorio oficial de Google Fonts.

## Estructura

- `fuentes_maestras/`: TTF originales, metadatos y licencia por familia.
- `fuentes_web/`: WOFF2 con subconjunto latino ampliado y CSS por familia.
- `catalogo/`: inventario JSON/CSV, correcciones de nombres y combinaciones iniciales.
- `scripts/`: proceso reproducible para reconstruir este paquete.

## Regla de integración

Studio puede consultar el catálogo completo, pero una invitación pública debe cargar únicamente las
dos o tres familias que utilice. No se debe importar `fuentes_web/fonts.css` completo en producción;
el archivo global es una referencia y una herramienta de prueba.

## Licencias

Cada carpeta conserva la licencia de su familia. Antes de publicar una fuente, LIMEN debe mantener
ese archivo asociado y registrar la procedencia indicada en `ORIGEN.txt`.

## Cobertura

Todos los TTF originales y WOFF2 generados fueron examinados para tildes, diéresis, eñe, signos de
apertura y números. Una familia que no supere esa comprobación queda marcada como experimental y no
debe habilitarse en Studio. Los cortes de línea pueden variar por ancho de pantalla, aunque la familia
y sus métricas sean idénticas.
"""
    (output_root / "README.md").write_text(readme, encoding="utf-8")
    shutil.copy2(Path(__file__), scripts_root / Path(__file__).name)
    shutil.copy2(Path(__file__).parent / "selection.txt", scripts_root / "selection.txt")
    shutil.copy2(
        Path(__file__).parent / "recommended-additions.txt",
        scripts_root / "recommended-additions.txt",
    )
    shutil.copy2(Path(__file__).parent / "requirements.txt", scripts_root / "requirements.txt")

    manifest = []
    for path in sorted(p for p in output_root.rglob("*") if p.is_file()):
        manifest.append({
            "path": str(path.relative_to(output_root)),
            "bytes": path.stat().st_size,
            "sha256": sha256(path),
        })
    (output_root / "MANIFEST.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps({
        "families": len(rows),
        "tiers": tier_counts,
        "categories": category_counts,
        "licenses": license_counts,
        "output": str(output_root),
    }, ensure_ascii=False, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    build(args.source.resolve(), args.output.resolve())


if __name__ == "__main__":
    main()
