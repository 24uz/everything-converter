"use strict";

/* =========================================================
   EVERYTHING CONVERTER
   No libraries. No API. GitHub Pages compatible.
========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

/* =========================================================
   STATE
========================================================= */

let currentValue = 10000;
let currentUnit = "hours";
let currentResultText = "";
let weirdPool = [];
let lastWeirdIndex = -1;

/* =========================================================
   ASSUMPTIONS
========================================================= */

const assumptions = {
    wage: 13.45,
    coffee: 4,
    meal: 11,
    subscription: 12,
    rent: 30,
    console: 499,
    burger: 5,
    step: 0.75
};

/* =========================================================
   UNITS
========================================================= */

const units = {
    seconds: {
        category: "time",
        label: "Seconds",
        short: "seconds",
        base: 1
    },

    minutes: {
        category: "time",
        label: "Minutes",
        short: "minutes",
        base: 60
    },

    hours: {
        category: "time",
        label: "Hours",
        short: "hours",
        base: 3600
    },

    days: {
        category: "time",
        label: "Days",
        short: "days",
        base: 86400
    },

    weeks: {
        category: "time",
        label: "Weeks",
        short: "weeks",
        base: 604800
    },

    months: {
        category: "time",
        label: "Months",
        short: "months",
        base: 2629800
    },

    years: {
        category: "time",
        label: "Years",
        short: "years",
        base: 31557600
    },

    decades: {
        category: "time",
        label: "Decades",
        short: "decades",
        base: 315576000
    },

    centuries: {
        category: "time",
        label: "Centuries",
        short: "centuries",
        base: 3155760000
    },

    metres: {
        category: "distance",
        label: "Metres",
        short: "m",
        base: 1
    },

    kilometres: {
        category: "distance",
        label: "Kilometres",
        short: "km",
        base: 1000
    },

    miles: {
        category: "distance",
        label: "Miles",
        short: "miles",
        base: 1609.344
    },

    feet: {
        category: "distance",
        label: "Feet",
        short: "ft",
        base: 0.3048
    },

    yards: {
        category: "distance",
        label: "Yards",
        short: "yd",
        base: 0.9144
    },

    inches: {
        category: "distance",
        label: "Inches",
        short: "in",
        base: 0.0254
    },

    grams: {
        category: "weight",
        label: "Grams",
        short: "g",
        base: 1
    },

    kilograms: {
        category: "weight",
        label: "Kilograms",
        short: "kg",
        base: 1000
    },

    pounds: {
        category: "weight",
        label: "Pounds",
        short: "lb",
        base: 453.59237
    },

    ounces: {
        category: "weight",
        label: "Ounces",
        short: "oz",
        base: 28.349523125
    },

    tonnes: {
        category: "weight",
        label: "Tonnes",
        short: "tonnes",
        base: 1000000
    },

    calories: {
        category: "calories",
        label: "Calories",
        short: "calories",
        base: 1
    },

    bytes: {
        category: "data",
        label: "Bytes",
        short: "bytes",
        base: 1
    },

    kb: {
        category: "data",
        label: "Kilobytes",
        short: "KB",
        base: 1000
    },

    mb: {
        category: "data",
        label: "Megabytes",
        short: "MB",
        base: 1000000
    },

    gb: {
        category: "data",
        label: "Gigabytes",
        short: "GB",
        base: 1000000000
    },

    tb: {
        category: "data",
        label: "Terabytes",
        short: "TB",
        base: 1000000000000
    },

    pb: {
        category: "data",
        label: "Petabytes",
        short: "PB",
        base: 1000000000000000
    },

    joules: {
        category: "energy",
        label: "Joules",
        short: "J",
        base: 1
    },

    kj: {
        category: "energy",
        label: "Kilojoules",
        short: "kJ",
        base: 1000
    },

    kwh: {
        category: "energy",
        label: "Kilowatt-hours",
        short: "kWh",
        base: 3600000
    },

    gbp: {
        category: "money",
        label: "British Pounds",
        short: "£",
        base: 1
    },

    usd: {
        category: "money",
        label: "US Dollars",
        short: "$",
        base: 0.79
    },

    eur: {
        category: "money",
        label: "Euros",
        short: "€",
        base: 0.86
    }
};

const categoryNames = {
    time: "Time",
    money: "Money",
    distance: "Distance",
    weight: "Weight",
    calories: "Calories",
    data: "Data",
    energy: "Energy"
};

/* =========================================================
   CATEGORY UNIT ORDER
========================================================= */

const categoryUnits = {
    time: [
        "seconds",
        "minutes",
        "hours",
        "days",
        "weeks",
        "months",
        "years",
        "decades",
        "centuries"
    ],

    money: [
        "gbp",
        "usd",
        "eur"
    ],

    distance: [
        "metres",
        "kilometres",
        "miles",
        "feet",
        "yards",
        "inches"
    ],

    weight: [
        "grams",
        "kilograms",
        "pounds",
        "ounces",
        "tonnes"
    ],

    calories: [
        "calories"
    ],

    data: [
        "bytes",
        "kb",
        "mb",
        "gb",
        "tb",
        "pb"
    ],

    energy: [
        "joules",
        "kj",
        "kwh"
    ]
};

/* =========================================================
   FORMATTERS
========================================================= */

function formatNumber(value, maxDecimals = 2) {
    if (!Number.isFinite(value)) return "—";

    const absolute = Math.abs(value);

    if (absolute >= 1e15) {
        return value.toExponential(2);
    }

    if (absolute >= 1000000) {
        return new Intl.NumberFormat("en-GB", {
            maximumFractionDigits: maxDecimals
        }).format(value);
    }

    if (absolute >= 1000) {
        return new Intl.NumberFormat("en-GB", {
            maximumFractionDigits: maxDecimals
        }).format(value);
    }

    if (absolute < 0.01 && absolute !== 0) {
        return value.toPrecision(3);
    }

    return new Intl.NumberFormat("en-GB", {
        maximumFractionDigits: maxDecimals
    }).format(value);
}

function formatMoney(value, currency = "£") {
    return `${currency}${formatNumber(value, 2)}`;
}

function plural(value, singular, pluralWord = `${singular}s`) {
    return Math.abs(value - 1) < 0.00001 ? singular : pluralWord;
}

function niceUnit(unit, value) {
    const info = units[unit];

    if (!info) return unit;

    return plural(value, info.short);
}

/* =========================================================
   CONVERSION
========================================================= */

function toBase(value, unit) {
    return value * units[unit].base;
}

function fromBase(value, unit) {
    return value / units[unit].base;
}

function convertBetween(value, fromUnit, toUnit) {
    return fromBase(toBase(value, fromUnit), toUnit);
}

/* =========================================================
   SYMBOL
========================================================= */

function updateInputSymbol() {
    const symbol = $("#inputSymbol");
    const unit = units[currentUnit];

    if (!symbol || !unit) return;

    if (currentUnit === "gbp") {
        symbol.textContent = "£";
    } else if (currentUnit === "usd") {
        symbol.textContent = "$";
    } else if (currentUnit === "eur") {
        symbol.textContent = "€";
    } else {
        symbol.textContent = "";
    }
}

/* =========================================================
   UNIT SELECT
========================================================= */

function populateUnits(selectedUnit = currentUnit) {
    const select = $("#unitSelect");
    if (!select) return;

    const category = units[selectedUnit]?.category || "time";

    select.innerHTML = "";

    categoryUnits[category].forEach((unitKey) => {
        const option = document.createElement("option");
        option.value = unitKey;
        option.textContent = units[unitKey].label;

        if (unitKey === selectedUnit) {
            option.selected = true;
        }

        select.appendChild(option);
    });

    currentUnit = selectedUnit;
    updateInputSymbol();
}

/* =========================================================
   DESCRIPTIONS
========================================================= */

function timeDescription(value, unit) {
    const hours = convertBetween(value, unit, "hours");

    if (hours >= 24) {
        return `That's roughly ${formatNumber(hours / 24, 1)} days of continuous time.`;
    }

    return `That's about ${formatNumber(hours, 1)} hours.`;
}

function distanceDescription(value, unit) {
    const miles = convertBetween(value, unit, "miles");
    const km = convertBetween(value, unit, "kilometres");

    return `That's about ${formatNumber(miles, 1)} miles, or ${formatNumber(km, 1)} km.`;
}

function weightDescription(value, unit) {
    const kg = convertBetween(value, unit, "kilograms");

    return `That's approximately ${formatNumber(kg, 1)} kg.`;
}

function dataDescription(value, unit) {
    const gb = convertBetween(value, unit, "gb");

    return `That's roughly ${formatNumber(gb, 2)} GB of data.`;
}

function caloriesDescription(value, unit) {
    const calories = convertBetween(value, unit, "calories");

    return `${formatNumber(calories, 0)} calories of energy — a simplified comparison, not a prediction of weight gain or loss.`;
}

function energyDescription(value, unit) {
    const kwh = convertBetween(value, unit, "kwh");

    return `That's approximately ${formatNumber(kwh, 3)} kWh of energy.`;
}

function moneyDescription(value, unit) {
    const gbp = convertBetween(value, unit, "gbp");

    return `Using an approximate exchange rate, that's around ${formatMoney(gbp)}.`;
}

/* =========================================================
   JOURNEY
========================================================= */

function buildJourney(value, unit) {
    const category = units[unit].category;
    const journey = $("#conversionJourney");

    if (!journey) return;

    const steps = [];

    steps.push({
        label: "Original",
        value,
        unit,
        description: getOriginalDescription(value, unit)
    });

    if (category === "time") {
        const targets = [
            ["days", "Days"],
            ["weeks", "Weeks"],
            ["months", "Months"],
            ["years", "Years"]
        ];

        targets.forEach(([target, label]) => {
            const converted = convertBetween(value, unit, target);

            if (converted >= 0.01) {
                steps.push({
                    label,
                    value: converted,
                    unit: target,
                    description: timeDescription(value, unit)
                });
            }
        });
    }

    if (category === "distance") {
        const targets = [
            ["metres", "Metres"],
            ["kilometres", "Kilometres"],
            ["miles", "Miles"]
        ];

        targets.forEach(([target, label]) => {
            if (target === unit) return;

            const converted = convertBetween(value, unit, target);

            if (converted >= 0.01) {
                steps.push({
                    label,
                    value: converted,
                    unit: target,
                    description: distanceDescription(value, unit)
                });
            }
        });
    }

    if (category === "weight") {
        const targets = [
            ["kilograms", "Kilograms"],
            ["pounds", "Pounds"],
            ["tonnes", "Tonnes"]
        ];

        targets.forEach(([target, label]) => {
            if (target === unit) return;

            const converted = convertBetween(value, unit, target);

            if (converted >= 0.001) {
                steps.push({
                    label,
                    value: converted,
                    unit: target,
                    description: weightDescription(value, unit)
                });
            }
        });
    }

    if (category === "data") {
        const targets = [
            ["mb", "Megabytes"],
            ["gb", "Gigabytes"],
            ["tb", "Terabytes"],
            ["pb", "Petabytes"]
        ];

        targets.forEach(([target, label]) => {
            if (target === unit) return;

            const converted = convertBetween(value, unit, target);

            if (converted >= 0.0001) {
                steps.push({
                    label,
                    value: converted,
                    unit: target,
                    description: dataDescription(value, unit)
                });
            }
        });
    }

    if (category === "money") {
        ["usd", "eur", "gbp"].forEach((target) => {
            if (target === unit) return;

            const converted = convertBetween(value, unit, target);

            steps.push({
                label: units[target].label,
                value: converted,
                unit: target,
                description: moneyDescription(value, unit)
            });
        });
    }

    if (category === "calories") {
        steps.push({
            label: "Daily energy",
            value: value / 2500,
            unit: "days",
            customValue: `${formatNumber(value / 2500, 1)} days`,
            description: "Compared with a simplified 2,500 calorie daily reference."
        });
    }

    if (category === "energy") {
        const kwh = convertBetween(value, unit, "kwh");

        steps.push({
            label: "Kilowatt-hours",
            value: kwh,
            unit: "kwh",
            description: energyDescription(value, unit)
        });
    }

    journey.innerHTML = steps.map((step, index) => {
        const displayValue = step.customValue ||
            `${formatNumber(step.value, getDecimalPlaces(step.value))} ${units[step.unit]?.short || step.unit}`;

        return `
            <article class="conversion-step" style="animation-delay:${index * 70}ms">
                <div class="step-label">${escapeHTML(step.label)}</div>
                <div class="step-value">${escapeHTML(displayValue)}</div>
                <div class="step-description">
                    ${escapeHTML(step.description)}
                </div>
            </article>
        `;
    }).join("");
}

function getDecimalPlaces(value) {
    const absolute = Math.abs(value);

    if (absolute >= 1000000) return 1;
    if (absolute >= 1000) return 2;
    if (absolute >= 1) return 2;
    return 4;
}

function getOriginalDescription(value, unit) {
    const category = units[unit].category;

    switch (category) {
        case "time":
            return timeDescription(value, unit);

        case "distance":
            return distanceDescription(value, unit);

        case "weight":
            return weightDescription(value, unit);

        case "data":
            return dataDescription(value, unit);

        case "calories":
            return caloriesDescription(value, unit);

        case "energy":
            return energyDescription(value, unit);

        case "money":
            return moneyDescription(value, unit);

        default:
            return "";
    }
}

/* =========================================================
   COMPARISONS
========================================================= */

function buildComparisons(value, unit) {
    const category = units[unit].category;
    const grid = $("#comparisonGrid");

    if (!grid) return;

    let comparisons = [];

    if (category === "time") {
        comparisons = timeComparisons(value, unit);
    }

    if (category === "money") {
        comparisons = moneyComparisons(value, unit);
    }

    if (category === "distance") {
        comparisons = distanceComparisons(value, unit);
    }

    if (category === "weight") {
        comparisons = weightComparisons(value, unit);
    }

    if (category === "calories") {
        comparisons = calorieComparisons(value, unit);
    }

    if (category === "data") {
        comparisons = dataComparisons(value, unit);
    }

    if (category === "energy") {
        comparisons = energyComparisons(value, unit);
    }

    grid.innerHTML = comparisons.slice(0, 6).map((item) => `
        <article class="comparison-card">
            <div class="comparison-icon">${item.icon}</div>

            <div>
                <div class="comparison-label">${escapeHTML(item.label)}</div>
                <div class="comparison-value">${escapeHTML(item.value)}</div>
                <div class="comparison-note">${escapeHTML(item.note)}</div>
            </div>
        </article>
    `).join("");

    weirdPool = comparisons;
}

/* =========================================================
   TIME COMPARISONS
========================================================= */

function timeComparisons(value, unit) {
    const hours = convertBetween(value, unit, "hours");
    const days = hours / 24;

    return [
        {
            icon: "♪",
            label: "Songs",
            value: `${formatNumber(hours * 12, 0)} songs`,
            note: "Assuming roughly 5 minutes per song."
        },
        {
            icon: "▣",
            label: "Films",
            value: `${formatNumber(hours / 2, 1)} films`,
            note: "At around 2 hours per film."
        },
        {
            icon: "⚽",
            label: "Football matches",
            value: `${formatNumber(hours / 2, 1)} matches`,
            note: "Using a 90-minute match."
        },
        {
            icon: "◷",
            label: "Working days",
            value: `${formatNumber(hours / 8, 1)} days`,
            note: "Using an 8-hour working day."
        },
        {
            icon: "Z",
            label: "Sleeping",
            value: `${formatNumber(hours / 8, 1)} nights`,
            note: "At 8 hours of sleep per night."
        },
        {
            icon: "▤",
            label: "50-year working life",
            value: `${formatNumber((hours / (50 * 365.25 * 24)) * 100, 2)}%`,
            note: "Percentage of 50 years spent continuously."
        }
    ];
}

/* =========================================================
   MONEY COMPARISONS
========================================================= */

function moneyComparisons(value, unit) {
    const gbp = convertBetween(value, unit, "gbp");

    return [
        {
            icon: "☕",
            label: "Coffees",
            value: `${formatNumber(gbp / assumptions.coffee, 0)} coffees`,
            note: `At £${formatNumber(assumptions.coffee, 2)} each.`
        },
        {
            icon: "▣",
            label: "Takeaways",
            value: `${formatNumber(gbp / assumptions.meal, 0)} meals`,
            note: `At £${formatNumber(assumptions.meal, 2)} each.`
        },
        {
            icon: "£",
            label: "Work",
            value: `${formatNumber(gbp / assumptions.wage, 1)} hours`,
            note: `At £${formatNumber(assumptions.wage, 2)} per hour.`
        },
        {
            icon: "⌂",
            label: "Rent",
            value: `${formatNumber(gbp / assumptions.rent, 1)} days`,
            note: `At £${formatNumber(assumptions.rent, 2)} per day.`
        },
        {
            icon: "◉",
            label: "Consoles",
            value: `${formatNumber(gbp / assumptions.console, 1)} consoles`,
            note: `At £${formatNumber(assumptions.console, 0)} each.`
        },
        {
            icon: "●",
            label: "Big Macs",
            value: `${formatNumber(gbp / assumptions.burger, 0)} Big Macs`,
            note: `At £${formatNumber(assumptions.burger, 2)} each.`
        }
    ];
}

/* =========================================================
   DISTANCE COMPARISONS
========================================================= */

function distanceComparisons(value, unit) {
    const metres = convertBetween(value, unit, "metres");
    const miles = convertBetween(value, unit, "miles");
    const km = metres / 1000;

    return [
        {
            icon: "•",
            label: "Steps",
            value: `${formatNumber(metres / assumptions.step, 0)} steps`,
            note: `Using a ${formatNumber(assumptions.step, 2)} m average step.`
        },
        {
            icon: "⚽",
            label: "Football pitches",
            value: `${formatNumber(metres / 105, 1)} pitches`,
            note: "Using a 105 m pitch length."
        },
        {
            icon: "🏃",
            label: "Marathons",
            value: `${formatNumber(km / 42.195, 2)} marathons`,
            note: "A marathon is 42.195 km."
        },
        {
            icon: "🌍",
            label: "Around Earth",
            value: `${formatNumber(km / 40075, 3)} times`,
            note: "Earth's circumference is about 40,075 km."
        },
        {
            icon: "🚶",
            label: "Walking",
            value: `${formatNumber(miles / 3, 1)} hours`,
            note: "At roughly 3 mph walking speed."
        },
        {
            icon: "🚌",
            label: "London buses",
            value: `${formatNumber(metres / 12, 0)} buses`,
            note: "Using about 12 m per bus."
        }
    ];
}

/* =========================================================
   WEIGHT COMPARISONS
========================================================= */

function weightComparisons(value, unit) {
    const kg = convertBetween(value, unit, "kilograms");

    return [
        {
            icon: "👤",
            label: "Adults",
            value: `${formatNumber(kg / 75, 1)} people`,
            note: "Using a rough 75 kg reference."
        },
        {
            icon: "▣",
            label: "Sugar bags",
            value: `${formatNumber(kg, 1)} bags`,
            note: "Using 1 kg bags of sugar."
        },
        {
            icon: "💧",
            label: "Water",
            value: `${formatNumber(kg, 1)} litres`,
            note: "1 litre of water weighs about 1 kg."
        },
        {
            icon: "🐕",
            label: "Large dogs",
            value: `${formatNumber(kg / 30, 1)} dogs`,
            note: "Using a rough 30 kg reference."
        },
        {
            icon: "▰",
            label: "Bricks",
            value: `${formatNumber(kg / 2.2, 0)} bricks`,
            note: "Using about 2.2 kg per brick."
        }
    ];
}

/* =========================================================
   CALORIE COMPARISONS
========================================================= */

function calorieComparisons(value, unit) {
    const calories = convertBetween(value, unit, "calories");

    return [
        {
            icon: "◷",
            label: "Daily energy",
            value: `${formatNumber(calories / 2500, 1)} days`,
            note: "Compared with 2,500 calories per day."
        },
        {
            icon: "●",
            label: "Big Macs",
            value: `${formatNumber(calories / 590, 1)}`,
            note: "Very rough comparison using ~590 calories each."
        },
        {
            icon: "▣",
            label: "Chocolate bars",
            value: `${formatNumber(calories / 230, 1)}`,
            note: "Using roughly 230 calories per bar."
        },
        {
            icon: "🍕",
            label: "Pizza",
            value: `${formatNumber(calories / 2000, 1)}`,
            note: "Using roughly 2,000 calories per pizza."
        }
    ];
}

/* =========================================================
   DATA COMPARISONS
========================================================= */

function dataComparisons(value, unit) {
    const gb = convertBetween(value, unit, "gb");
    const tb = convertBetween(value, unit, "tb");

    return [
        {
            icon: "▧",
            label: "Photos",
            value: `${formatNumber((gb * 1000) / 4, 0)}`,
            note: "Assuming roughly 4 MB per photo."
        },
        {
            icon: "▶",
            label: "HD films",
            value: `${formatNumber(gb / 5, 1)}`,
            note: "Assuming about 5 GB per HD film."
        },
        {
            icon: "♪",
            label: "Songs",
            value: `${formatNumber((gb * 1000) / 5, 0)}`,
            note: "Assuming roughly 5 MB per song."
        },
        {
            icon: "◎",
            label: "Music listening",
            value: `${formatNumber((gb * 1000) / 5 / 12, 0)} hours`,
            note: "Roughly 5 MB per song and 5 minutes per song."
        },
        {
            icon: "▤",
            label: "Terabytes",
            value: `${formatNumber(tb, 3)} TB`,
            note: "1 TB = 1,000 GB in this converter."
        }
    ];
}

/* =========================================================
   ENERGY COMPARISONS
========================================================= */

function energyComparisons(value, unit) {
    const kwh = convertBetween(value, unit, "kwh");

    return [
        {
            icon: "▣",
            label: "Phone charges",
            value: `${formatNumber((kwh * 1000) / 15, 0)}`,
            note: "Using roughly 15 Wh per full charge."
        },
        {
            icon: "♨",
            label: "Kettle boils",
            value: `${formatNumber((kwh * 1000) / 1000, 1)}`,
            note: "Using about 1 kWh per boil."
        },
        {
            icon: "☼",
            label: "LED bulb",
            value: `${formatNumber((kwh * 1000) / 10, 0)} hours`,
            note: "Using a 10 W LED bulb."
        },
        {
            icon: "🚿",
            label: "Showers",
            value: `${formatNumber(kwh / 2.5, 1)}`,
            note: "Using roughly 2.5 kWh per shower."
        },
        {
            icon: "🚗",
            label: "Electric car",
            value: `${formatNumber((kwh * 1000) / 300, 1)} miles`,
            note: "Using about 300 Wh per mile."
        }
    ];
}

/* =========================================================
   WEIRD COMPARISON
========================================================= */

function generateWeirdComparison() {
    if (!weirdPool.length) return;

    let index;

    do {
        index = Math.floor(Math.random() * weirdPool.length);
    } while (weirdPool.length > 1 && index === lastWeirdIndex);

    lastWeirdIndex = index;

    const item = weirdPool[index];

    $("#weirdTitle").textContent = item.value;
    $("#weirdDescription").textContent =
        `${item.label}: ${item.note}`;

    $("#weirdResult").hidden = false;

    $("#weirdResult").scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}

/* =========================================================
   CONVERT
========================================================= */

function performConversion(updateUrl = true) {
    const input = $("#mainInput");

    if (!input) return;

    const value = Number(input.value);

    if (!Number.isFinite(value) || value < 0) {
        showToast("Enter a valid number.");
        input.focus();
        return;
    }

    currentValue = value;
    currentUnit = $("#unitSelect").value;

    const unitInfo = units[currentUnit];

    $("#resultsTitle").textContent =
        `${formatNumber(value, 2)} ${unitInfo.short}`;

    $("#results").hidden = false;

    buildJourney(value, currentUnit);
    buildComparisons(value, currentUnit);

    $("#weirdResult").hidden = true;
    lastWeirdIndex = -1;

    currentResultText = buildCopyText(value, currentUnit);

    if (updateUrl) {
        updateUrlParams();
    }

    $("#results").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

/* =========================================================
   COPY TEXT
========================================================= */

function buildCopyText(value, unit) {
    const category = units[unit].category;
    const original = `${formatNumber(value, 2)} ${units[unit].short}`;

    let parts = [];

    if (category === "time") {
        const days = convertBetween(value, unit, "days");
        const weeks = convertBetween(value, unit, "weeks");
        const years = convertBetween(value, unit, "years");

        parts = [
            original,
            `≈ ${formatNumber(days, 1)} days`,
            `≈ ${formatNumber(weeks, 1)} weeks`,
            `≈ ${formatNumber(years, 2)} years`
        ];
    }

    if (category === "money") {
        const gbp = convertBetween(value, unit, "gbp");

        parts = [
            original,
            `≈ ${formatNumber(gbp / assumptions.coffee, 0)} coffees`,
            `≈ ${formatNumber(gbp / assumptions.meal, 0)} takeaway meals`,
            `≈ ${formatNumber(gbp / assumptions.wage, 1)} hours of work`
        ];
    }

    if (category === "distance") {
        const metres = convertBetween(value, unit, "metres");

        parts = [
            original,
            `≈ ${formatNumber(metres / assumptions.step, 0)} steps`,
            `≈ ${formatNumber(metres / 105, 1)} football pitches`,
            `≈ ${formatNumber(metres / 42195, 2)} marathons`
        ];
    }

    if (category === "weight") {
        const kg = convertBetween(value, unit, "kilograms");

        parts = [
            original,
            `≈ ${formatNumber(kg, 1)} kg`,
            `≈ ${formatNumber(kg / 1, 0)} bags of sugar`,
            `≈ ${formatNumber(kg / 75, 1)} average adults`
        ];
    }

    if (category === "calories") {
        const calories = convertBetween(value, unit, "calories");

        parts = [
            original,
            `≈ ${formatNumber(calories / 2500, 1)} days of 2,500 calories`,
            `≈ ${formatNumber(calories / 590, 1)} Big Macs`
        ];
    }

    if (category === "data") {
        const gb = convertBetween(value, unit, "gb");

        parts = [
            original,
            `≈ ${formatNumber((gb * 1000) / 4, 0)} photos`,
            `≈ ${formatNumber(gb / 5, 1)} HD films`,
            `≈ ${formatNumber((gb * 1000) / 5, 0)} songs`
        ];
    }

    if (category === "energy") {
        const kwh = convertBetween(value, unit, "kwh");

        parts = [
            original,
            `≈ ${formatNumber((kwh * 1000) / 15, 0)} phone charges`,
            `≈ ${formatNumber(kwh / 2.5, 1)} showers`,
            `≈ ${formatNumber((kwh * 1000) / 10, 0)} hours of LED lighting`
        ];
    }

    return parts.join(" = ");
}

/* =========================================================
   URL PARAMS
========================================================= */

function updateUrlParams() {
    const url = new URL(window.location.href);

    url.searchParams.set("value", currentValue);
    url.searchParams.set("unit", currentUnit);

    history.replaceState({}, "", url);
}

function loadFromUrl() {
    const params = new URLSearchParams(window.location.search);

    const value = Number(params.get("value"));
    const unit = params.get("unit");

    if (
        Number.isFinite(value) &&
        value >= 0 &&
        unit &&
        units[unit]
    ) {
        $("#mainInput").value = value;
        populateUnits(unit);
        performConversion(false);
        return true;
    }

    return false;
}

/* =========================================================
   CLIPBOARD
========================================================= */

async function copyText(text, message = "Copied.") {
    try {
        await navigator.clipboard.writeText(text);
        showToast(message);
        return;
    } catch {
        const textarea = document.createElement("textarea");

        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand("copy");
            showToast(message);
        } catch {
            showToast("Couldn't copy automatically.");
        }

        textarea.remove();
    }
}

/* =========================================================
   SHARE
========================================================= */

async function shareResult() {
    const url = window.location.href;

    if (navigator.share) {
        try {
            await navigator.share({
                title: "Everything Converter",
                text: currentResultText,
                url
            });

            return;
        } catch {
            return;
        }
    }

    await copyText(url, "Link copied.");
}

/* =========================================================
   SURPRISE ME
========================================================= */

const surprises = [
    { value: 1000000, unit: "seconds" },
    { value: 1000000000, unit: "seconds" },
    { value: 100000, unit: "gbp" },
    { value: 1000, unit: "miles" },
    { value: 10, unit: "tb" },
    { value: 10000, unit: "hours" },
    { value: 500, unit: "kilograms" },
    { value: 5000000, unit: "calories" },
    { value: 1000000, unit: "kwh" }
];

function surpriseMe() {
    const random =
        surprises[Math.floor(Math.random() * surprises.length)];

    $("#mainInput").value = random.value;
    populateUnits(random.unit);
    performConversion();
}

/* =========================================================
   ASSUMPTIONS
========================================================= */

function readAssumptions() {
    const fields = {
        wage: "#assumeWage",
        coffee: "#assumeCoffee",
        meal: "#assumeMeal",
        subscription: "#assumeSubscription",
        rent: "#assumeRent",
        console: "#assumeConsole",
        burger: "#assumeBurger",
        step: "#assumeStep"
    };

    Object.entries(fields).forEach(([key, selector]) => {
        const value = Number($(selector)?.value);

        if (Number.isFinite(value) && value > 0) {
            assumptions[key] = value;
        }
    });
}

function applyAssumptions() {
    readAssumptions();

    if (!$("#results").hidden) {
        buildComparisons(currentValue, currentUnit);
        currentResultText = buildCopyText(currentValue, currentUnit);
    }

    showToast("Assumptions applied.");
}

/* =========================================================
   ASSUMPTIONS COLLAPSE
========================================================= */

function toggleAssumptions() {
    const content = $("#assumptionsContent");
    const button = $("#assumptionsToggle");

    const isOpen = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!isOpen));
    button.textContent = isOpen ? "+" : "−";

    content.hidden = isOpen;
}

/* =========================================================
   THEME
========================================================= */

function loadTheme() {
    const saved = localStorage.getItem("everything-converter-theme");

    if (saved === "dark") {
        document.documentElement.dataset.theme = "dark";
    } else if (saved === "light") {
        document.documentElement.dataset.theme = "light";
    } else {
        const prefersDark =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (prefersDark) {
            document.documentElement.dataset.theme = "dark";
        }
    }

    updateThemeIcon();
}

function toggleTheme() {
    const html = document.documentElement;

    const isDark =
        html.dataset.theme === "dark";

    html.dataset.theme = isDark ? "light" : "dark";

    localStorage.setItem(
        "everything-converter-theme",
        html.dataset.theme
    );

    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = $("#themeIcon");

    if (!icon) return;

    const isDark =
        document.documentElement.dataset.theme === "dark";

    icon.textContent = isDark ? "☀" : "☾";
}

/* =========================================================
   TOAST
========================================================= */

let toastTimer;

function showToast(message) {
    const toast = $("#toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* =========================================================
   EXAMPLES
========================================================= */

function setupExampleButtons() {
    $$(".example-chip").forEach((button) => {
        button.addEventListener("click", () => {
            const value = Number(button.dataset.value);
            const unit = button.dataset.unit;

            $("#mainInput").value = value;

            if (units[unit]) {
                populateUnits(unit);
            }

            performConversion();
        });
    });
}

/* =========================================================
   EXPLORE
========================================================= */

function setupExploreButtons() {
    $$(".explore-card").forEach((button) => {
        button.addEventListener("click", () => {
            const value = Number(button.dataset.value);
            const unit = button.dataset.unit;

            $("#mainInput").value = value;

            if (units[unit]) {
                populateUnits(unit);
            }

            performConversion();
        });
    });
}

/* =========================================================
   CATEGORY NAVIGATION
========================================================= */

function setupUnitChange() {
    $("#unitSelect").addEventListener("change", () => {
        currentUnit = $("#unitSelect").value;
        updateInputSymbol();
    });
}

/* =========================================================
   INITIALISE
========================================================= */

function init() {
    loadTheme();

    populateUnits("hours");

    $("#converterForm").addEventListener("submit", (event) => {
        event.preventDefault();
        performConversion();
    });

    $("#unitSelect").addEventListener("change", () => {
        currentUnit = $("#unitSelect").value;
        updateInputSymbol();
    });

    $("#themeToggle").addEventListener("click", toggleTheme);

    $("#copyResult").addEventListener("click", () => {
        copyText(currentResultText || buildCopyText(currentValue, currentUnit));
    });

    $("#shareResult").addEventListener("click", shareResult);

    $("#weirdButton").addEventListener(
        "click",
        generateWeirdComparison
    );

    $("#anotherWeird").addEventListener(
        "click",
        generateWeirdComparison
    );

    $("#surpriseButton").addEventListener(
        "click",
        surpriseMe
    );

    $("#applyAssumptions").addEventListener(
        "click",
        applyAssumptions
    );

    $("#assumptionsToggle").addEventListener(
        "click",
        toggleAssumptions
    );

    setupExampleButtons();
    setupExploreButtons();

    const loaded = loadFromUrl();

    if (!loaded) {
        updateInputSymbol();
    }
}

/* =========================================================
   START
========================================================= */

document.addEventListener("DOMContentLoaded", init);