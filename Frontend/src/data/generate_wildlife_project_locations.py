import json
from pathlib import Path

regions = [
    ("India", "Western Ghats", "Karnataka", "forest-agriculture fringe", "Asian elephant", 11.786, 76.152, "Karnataka Elephant Corridors", "PRJ-IND-001", "active"),
    ("India", "Eastern India", "West Bengal", "mangrove estuary", "Royal Bengal tiger", 21.949, 88.806, "Sundarbans Mangrove Protection", "PRJ-IND-002", "active"),
    ("India", "Northeast India", "Assam", "grassland-wetland mosaic", "greater one-horned rhinoceros", 26.574, 93.171, "Kaziranga Rhino Reserve", "PRJ-IND-003", "active"),
    ("India", "Trans-Himalayan", "Ladakh", "alpine desert and pasture", "snow leopard", 34.152, 77.568, "Himalayan Snow Leopard Zone", "PRJ-IND-004", "active"),
    ("India", "Eastern Ghats", "Andhra Pradesh", "deciduous forest and corridor", "gaur", 15.451, 78.512, "Nallamala Gaur Habitat Watch", "PRJ-IND-005", "planned"),
    ("India", "Western Ghats", "Maharashtra", "watershed forest", "lion-tailed macaque", 18.593, 73.802, "Western Ghats Forest Water Grid", "PRJ-IND-006", "active"),
    ("Nepal", "Himalayan Foothills", "Lumbini", "temperate forest", "red panda", 28.092, 83.676, "Nepal Forest Edge Mapping", "PRJ-NEP-001", "active"),
    ("Kenya", "Laikipia", "Laikipia County", "savanna corridor", "African lion", -0.256, 36.812, "Laikipia Lion Corridors", "PRJ-KEN-001", "active"),
    ("Tanzania", "Serengeti", "Arusha", "grassland migration", "African wild dog", -2.111, 34.815, "Serengeti Wild Dog Network", "PRJ-TZA-001", "active"),
    ("Brazil", "Amazon Basin", "Amazonas", "rainforest", "jaguar", -3.095, -60.012, "Amazon Habitat Resilience", "PRJ-BRA-001", "active"),
]

names = [
    "Forest Edge Watch", "Community Species Network", "River Corridor Response", "Cocoa Forest Buffer",
    "Highland Ecological Plan", "Dryland Water Recovery", "Mangrove Restoration Watch", "Elephant Safety Corridor",
    "Grassland Monitoring Unit", "Tiger Habitat Recovery", "Wetland Bird Network", "Forest Fire Response",
]

records = []

for i in range(50):
    country, region, state, landscape, species, lat, lon, projectName, projectId, status = regions[i % len(regions)]
    source_name = names[i % len(names)]
    projectName = f"{projectName.split(' ')[0]} {source_name}"
    budget = 800000 + i * 43000
    allocations = {
        "fieldOperations": round(budget * 0.28),
        "habitatRestoration": round(budget * 0.22),
        "technology": round(budget * 0.14),
        "communityEngagement": round(budget * 0.17),
        "veterinaryCare": round(budget * 0.08),
        "administration": round(budget * 0.11),
    }
    roster = [
        {"name": f"Lead {i+1}", "role": "Project Lead", "team": "Field Strategy", "training": "Advanced"},
        {"name": f"Ecologist {i+1}", "role": "Field Ecologist", "team": "Habitat Mapping", "training": "Specialist"},
        {"name": f"Coordinator {i+1}", "role": "Community Coordinator", "team": "Local Engagement", "training": "Basic"},
    ]
    logs = [
        {
            "quarter": "Q1",
            "status": "completed",
            "date": "2026-03-31T00:00:00.000Z",
            "title": "Baseline survey",
            "progressPercent": 100,
            "summary": "Field survey and early conservation baseline established.",
        },
        {
            "quarter": "Q2",
            "status": "completed",
            "date": "2026-06-30T00:00:00.000Z",
            "title": "Implementation review",
            "progressPercent": 100,
            "summary": "Field team milestones delivered and local plans verified.",
        },
        {
            "quarter": "Q3",
            "status": "in_progress",
            "date": "2026-09-30T00:00:00.000Z",
            "title": "Field operations",
            "progressPercent": 70 + (i % 30),
            "summary": "Field coverage and habitat recovery operations are active.",
        },
        {
            "quarter": "Q4",
            "status": "planned",
            "date": "2026-12-31T00:00:00.000Z",
            "title": "Scaling and review",
            "progressPercent": 0,
            "summary": "Plan next investment round and review quarterly outputs.",
        },
    ]

    records.append({
        "projectId": f"WH-GEO-{str(100 + i).zfill(3)}",
        "projectName": projectName,
        "projectSlug": projectName.lower().replace(" ", "-").replace("&", "and"),
        "country": country,
        "region": region,
        "state": state,
        "landscapeType": landscape,
        "status": status,
        "priority": "high" if i % 3 == 0 else ("critical" if i % 4 == 0 else "medium"),
        "coordinates": {
            "latitude": round(lat + (i % 5) * 0.65, 3),
            "longitude": round(lon + (i % 4) * 0.92, 3),
            "geoHash": f"geo{i:04d}",
        },
        "species": {
            "focus": [species, "forest edge species", "migratory species"],
            "populationEstimate": 150 + i * 23,
            "surveyMethod": "camera trap and field transect",
            "riskLevel": "high" if i % 2 == 0 else "medium",
            "conservationStatus": "active monitoring and restoration",
        },
        "budget": {
            "currency": "INR",
            "totalBudget": budget,
            "allocations": allocations,
            "spentToDate": round(budget * 0.55),
            "quarterlySpend": { "Q1": round(budget * 0.22), "Q2": round(budget * 0.24), "Q3": round(budget * 0.26), "Q4": round(budget * 0.28) },
        },
        "fieldStaff": {
            "projectLead": f"Field Lead {i+1}",
            "operationalManager": f"Ops Manager {i+1}",
            "rangers": 6 + (i % 9) * 2,
            "scientists": 2 + (i % 4),
            "communityWorkers": 10 + (i % 12)*3,
            "volunteers": 12 + (i % 20),
            "roster": roster,
        },
        "milestones": {
            "quarter": "Q4",
            "year": 2026,
            "logs": logs,
        },
    })

output_path = Path('Frontend/src/data/wildlifeProjectLocations.js')
output_path.parent.mkdir(parents=True, exist_ok=True)

text = "const projectLocations = " + json.dumps(records, indent=2) + ";\n\nmodule.exports = { projectLocations };\n"
output_path.write_text(text, encoding='utf-8')

print(f"created {output_path} with {len(records)} records")
