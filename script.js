/* =========================================================
   EVERYTHING CONVERTER
   Vanilla JavaScript conversion + comparison engine
   ========================================================= */

"use strict";

/* =========================================================
   HELPERS
   ========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function formatNumber(value, decimals = 1) {
    if (!Number.isFinite(value)) return "—";

    const abs = Math.abs(value);

    let maximumFractionDigits = decimals;

    if (abs >= 1000) maximumFractionDigits = 1;
    if (abs >= 1000000) maximumFractionDigits = 2;
    if (abs < 1 && abs !== 0) maximumFractionDigits = 2;

    return new Intl.NumberFormat("en-GB", {
        maximumFractionDigits,
        minimumFractionDigits: 0
    }).format(value);
}

function formatMoney(value, currency = "GBP") {
    if (!Number.isFinite(value)) return "—";

    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency,
        maximumFractionDigits: 2
    }).format(value);
}

function formatApprox(value, unit, decimals = 1) {
    return `≈ ${formatNumber(value, decimals)} ${unit}`;
}

function pluralize(value, singular, plural = `${singular}s`) {
    return Math.abs(value - 1) < 0.000001 ? singular : plural;
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* =========================================================
   CONVERSION DEFINITIONS
   ========================================================= */

const conversions = {
    time: {
        seconds: {
            label: "Seconds",
            short: "sec",
            toBase: value => value
        },

        minutes: {
            label: "Minutes",
            short: "min",
            toBase: value => value * 60
        },

        hours: {
            label: "Hours",
            short: "hr",
            toBase: value => value * 3600
        },

        days: {
            label: "Days",
            short: "days",
            toBase: value => value * 86400
        },

        weeks: {
            label: "Weeks",
            short: "weeks",
            toBase: value => value * 604800
        },

        months: {
            label: "Months",
            short: "months",
            toBase: value => value * 2629800
        },

        years: {
            label: "Years",
            short: "years",
            toBase: value => value * 31557600
        },

        decades: {
            label: "Decades",
            short: "decades",
            toBase: value => value * 315576000
        },

        centuries: {
            label: "Centuries",
            short: "centuries",
            toBase: value => value * 3155760000
        }
    },

    distance: {
        metres: {
            label: "Metres",
            short: "m",
            toBase: value => value
        },

        kilometres: {
            label: "Kilometres",
            short: "km",
            toBase: value => value * 1000
        },

        miles: {
            label: "Miles",
            short: "mi",
            toBase: value => value * 1609.344
        },

        feet: {
            label: "Feet",
            short: "ft",
            toBase: value => value * 0.3048
        },

        yards: {
            label: "Yards",
            short: "yd",
            toBase: value => value * 0.9144
        },

        inches: {
            label: "Inches",
            short: "in",
            toBase: value => value * 0.0254
        }
    },

    weight: {
        grams: {
            label: "Grams",
            short: "g",
            toBase: value => value
        },

        kilograms: {
            label: "Kilograms",
            short: "kg",
            toBase: value => value * 1000
        },

        pounds: {
            label: "Pounds",
            short: "lb",
            toBase: value => value * 453.59237
        },

        ounces: {
            label: "Ounces",
            short: "oz",
            toBase: value => value * 28.349523125
        },

        tonnes: {
            label: "Tonnes",
            short: "t",
            toBase: value => value * 1000000
        }
    },

    data: {
        bytes: {
            label: "Bytes",
            short: "B",
            toBase: value => value
        },

        kilobytes: {
            label: "Kilobytes",
            short: "KB",
            toBase: value => value * 1000
        },

        megabytes: {
            label: "Megabytes",
            short: "MB",
            toBase: value => value * 1000000
        },

        gigabytes: {
            label: "Gigabytes",
            short: "GB",
            toBase: value => value * 1000000000
        },

        terabytes: {
            label: "Terabytes",
            short: "TB",
            toBase: value => value * 1000000000000
        },

        petabytes: {
            label: "Petabytes",
            short: "PB",
            toBase: value => value * 1000000000000000
        }
    },

    energy: {
        joules: {
            label: "Joules",
            short: "J",
            toBase: value => value
        },

        kilojoules: {
            label: "Kilojoules",
            short: "kJ",
            toBase: value => value * 1000
        },

        calories: {
            label: "Calories",
            short: "kcal",
            toBase: value => value * 4184
        },

        kilowattHours: {
            label: "Kilowatt-hours",
            short: "kWh",
            toBase: value => value * 3600000
        }
    },

    calories: {
        calories: {
            label: "Calories",
            short: "kcal",
            toBase: value => value
        }
    },

    money: {
        GBP: {
            label: "British Pounds",
            short: "£",
            currency: "GBP"
        },

        USD: {
            label: "US Dollars",
            short: "$",
            currency: "USD"
        },

        EUR: {
            label: "Euros",
            short: "€",
            currency: "EUR"
        }
    }
};

/* =========================================================
   ASSUMPTIONS
   ========================================================= */

const defaultAssumptions = {
    wage: 13.45,
    coffee: 4.00,
    meal: 12.00,
    subscription: 12.99,
    rentPerDay: 30,
    console: 479.99,
    bigMac: 5.99,
    cinema: 12,
    petrolPerLitre: 1.45,
    flight: 120,
    phone: 799,

    stepsPerMile: 2100,
    walkingSpeedMph: 3,

    bagSugarKg: 1,
    waterLitresPerKg: 1,

    photoMB: 4,
    filmGB: 5,
    songMB: 5,

    phoneChargeWh: 15,
    kettleWh: 100,
    showerKWh: 2.5,
    ledWatts: 10,
    evWhPerMile: 300
};

let assumptions = {
    ...defaultAssumptions
};

/* =========================================================
   APPLICATION STATE
   ========================================================= */

const state = {
    category: "time",
    value: 10000,
    unit: "hours",
    lastResults: [],
    lastComparisonResults: [],
    lastInput: null
};

/* =========================================================
   CATEGORY METADATA
   ========================================================= */

const categoryMeta = {
    time: {
        title: "Time",
        description: "Turn time into something you can actually picture."
    },

    money: {
        title: "Money",
        description: "See what your money means in the real world."
    },

    distance: {
        title: "Distance",
        description: "Turn kilometres and miles into things you recognise."
    },

    weight: {
        title: "Weight",
        description: "Put a number into a physical perspective."
    },

    calories: {
        title: "Calories",
        description: "Turn energy into understandable equivalents."
    },

    data: {
        title: "Data",
        description: "Find out what your storage actually represents."
    },

    energy: {
        title: "Energy",
        description: "Translate energy into everyday actions."
    }
};

/* =========================================================
   TIME COMPARISONS
   ========================================================= */

const timeComparisons = [
    {
        name: "One-minute songs",
        icon: "🎧",
        calculate: seconds => seconds / 60,
        format: value =>
            `${formatNumber(value)} one-minute ${pluralize(value, "song")}`,
        description: "If every song lasted exactly one minute."
    },

    {
        name: "Two-hour films",
        icon: "🎬",
        calculate: seconds => seconds / 7200,
        format: value =>
            `${formatNumber(value)} two-hour ${pluralize(value, "film")}`,
        description: "Using a two-hour film as a rough reference."
    },

    {
        name: "Working days",
        icon: "💼",
        calculate: seconds => seconds / 28800,
        format: value =>
            `${formatNumber(value)} eight-hour ${pluralize(value, "working day")}`,
        description: "Based on eight working hours per day."
    },

    {
        name: "Sleeping nights",
        icon: "😴",
        calculate: seconds => seconds / 28800,
        format: value =>
            `${formatNumber(value)} eight-hour ${pluralize(value, "sleep")}`,
        description: "Assuming eight hours of sleep."
    },

    {
        name: "Weekends",
        icon: "🗓️",
        calculate: seconds => seconds / 172800,
        format: value =>
            `${formatNumber(value)} two-day ${pluralize(value, "weekend")}`,
        description: "A weekend represented as 48 hours."
    },

    {
        name: "Football matches",
        icon: "⚽",
        calculate: seconds => seconds / 5400,
        format: value =>
            `${formatNumber(value)} 90-minute football ${pluralize(value, "match")}`,
        description: "Ignoring stoppage time and half-time."
    }
];

/* =========================================================
   MONEY COMPARISONS
   ========================================================= */

const moneyComparisons = [
    {
        name: "Work",
        icon: "💼",
        calculate: value => value / assumptions.wage,
        format: value =>
            `${formatNumber(value)} hours of work`,
        description: `Using £${formatNumber(assumptions.wage, 2)}/hour.`
    },

    {
        name: "Coffees",
        icon: "☕",
        calculate: value => value / assumptions.coffee,
        format: value =>
            `${formatNumber(value)} coffees`,
        description: `Using £${formatNumber(assumptions.coffee, 2)} per coffee.`
    },

    {
        name: "Takeaways",
        icon: "🍔",
        calculate: value => value / assumptions.meal,
        format: value =>
            `${formatNumber(value)} takeaway meals`,
        description: `Using £${formatNumber(assumptions.meal, 2)} per meal.`
    },

    {
        name: "Subscriptions",
        icon: "📺",
        calculate: value => value / assumptions.subscription,
        format: value =>
            `${formatNumber(value)} months of subscriptions`,
        description: `Using £${formatNumber(assumptions.subscription, 2)} per month.`
    },

    {
        name: "Rent",
        icon: "🏠",
        calculate: value => value / assumptions.rentPerDay,
        format: value =>
            `${formatNumber(value)} days of rent`,
        description: `Using £${formatNumber(assumptions.rentPerDay, 2)} per day.`
    },

    {
        name: "Game consoles",
        icon: "🎮",
        calculate: value => value / assumptions.console,
        format: value =>
            `${formatNumber(value, 2)} game consoles`,
        description: `Using £${formatNumber(assumptions.console, 2)} per console.`
    },

    {
        name: "Big Macs",
        icon: "🍔",
        calculate: value => value / assumptions.bigMac,
        format: value =>
            `${formatNumber(value)} Big Macs`,
        description: `Using £${formatNumber(assumptions.bigMac, 2)} each.`
    },

    {
        name: "Cinema tickets",
        icon: "🎟️",
        calculate: value => value / assumptions.cinema,
        format: value =>
            `${formatNumber(value)} cinema tickets`,
        description: `Using £${formatNumber(assumptions.cinema, 2)} per ticket.`
    },

    {
        name: "Flights",
        icon: "✈️",
        calculate: value => value / assumptions.flight,
        format: value =>
            `${formatNumber(value, 1)} flights`,
        description: `Using £${formatNumber(assumptions.flight, 2)} per flight.`
    },

    {
        name: "Phones",
        icon: "📱",
        calculate: value => value / assumptions.phone,
        format: value =>
            `${formatNumber(value, 2)} phones`,
        description: `Using £${formatNumber(assumptions.phone, 2)} per phone.`
    }
];

/* =========================================================
   DISTANCE COMPARISONS
   ========================================================= */

const distanceComparisons = [
    {
        name: "Steps",
        icon: "👟",
        calculate: metres => metres / 1609.344 * assumptions.stepsPerMile,
        format: value => `${formatNumber(value)} steps`,
        description: "Using roughly 2,100 steps per mile."
    },

    {
        name: "Marathons",
        icon: "🏃",
        calculate: metres => metres / 42195,
        format: value => `${formatNumber(value, 2)} marathons`,
        description: "A marathon is 42.195 km."
    },

    {
        name: "Football pitches",
        icon: "⚽",
        calculate: metres => metres / 105,
        format: value => `${formatNumber(value)} football pitches long`,
        description: "Using 105 metres as a representative pitch length."
    },

    {
        name: "Walking time",
        icon: "🚶",
        calculate: metres =>
            (metres / 1609.344) / assumptions.walkingSpeedMph,
        format: value => `${formatNumber(value)} hours of walking`,
        description: `Using a ${assumptions.walkingSpeedMph} mph walking pace.`
    },

    {
        name: "Trips around Earth",
        icon: "🌍",
        calculate: metres => metres / 40075000,
        format: value => `${formatNumber(value, 4)} trips around Earth`,
        description: "Using Earth's approximate equatorial circumference."
    },

    {
        name: "London buses",
        icon: "🚌",
        calculate: metres => metres / 11,
        format: value => `${formatNumber(value)} London buses end-to-end`,
        description: "Using roughly 11 metres per bus."
    }
];

/* =========================================================
   WEIGHT COMPARISONS
   ========================================================= */

const weightComparisons = [
    {
        name: "Bags of sugar",
        icon: "🍬",
        calculate: grams => grams / (assumptions.bagSugarKg * 1000),
        format: value => `${formatNumber(value)} 1 kg bags of sugar`,
        description: "Using 1 kg bags as the reference."
    },

    {
        name: "Litres of water",
        icon: "💧",
        calculate: grams => grams / assumptions.waterLitresPerKg / 1000,
        format: value => `${formatNumber(value)} litres of water`,
        description: "Water weighs approximately 1 kg per litre."
    },

    {
        name: "Adult humans",
        icon: "🧍",
        calculate: grams => grams / 75000,
        format: value => `${formatNumber(value, 2)} average-sized adults`,
        description: "A deliberately rough 75 kg reference."
    },

    {
        name: "Large dogs",
        icon: "🐕",
        calculate: grams => grams / 30000,
        format: value => `${formatNumber(value, 2)} large dogs`,
        description: "Using 30 kg as a rough reference."
    },

    {
        name: "Bricks",
        icon: "🧱",
        calculate: grams => grams / 2200,
        format: value => `${formatNumber(value)} standard bricks`,
        description: "Using approximately 2.2 kg per brick."
    }
];

/* =========================================================
   CALORIE COMPARISONS
   ========================================================= */

const calorieComparisons = [
    {
        name: "Days of food",
        icon: "🍽️",
        calculate: calories => calories / 2500,
        format: value => `${formatNumber(value)} days at 2,500 kcal`,
        description: "A simplified 2,500 kcal/day reference."
    },

    {
        name: "Big Macs",
        icon: "🍔",
        calculate: calories => calories / 590,
        format: value => `${formatNumber(value)} Big Macs`,
        description: "Approximate energy equivalent; recipes vary."
    },

    {
        name: "Chocolate bars",
        icon: "🍫",
        calculate: calories => calories / 230,
        format: value => `${formatNumber(value)} chocolate bars`,
        description: "Using roughly 230 kcal per bar."
    },

    {
        name: "Pizzas",
        icon: "🍕",
        calculate: calories => calories / 1000,
        format: value => `${formatNumber(value)} pizzas`,
        description: "Using roughly 1,000 kcal per pizza."
    }
];

/* =========================================================
   DATA COMPARISONS
   ========================================================= */

const dataComparisons = [
    {
        name: "Photos",
        icon: "📸",
        calculate: bytes => bytes / (assumptions.photoMB * 1000000),
        format: value => `${formatNumber(value)} photos`,
        description: `Using ${assumptions.photoMB} MB per photo.`
    },

    {
        name: "HD films",
        icon: "🎬",
        calculate: bytes => bytes / (assumptions.filmGB * 1000000000),
        format: value => `${formatNumber(value)} HD films`,
        description: `Using ${assumptions.filmGB} GB per film.`
    },

    {
        name: "Songs",
        icon: "🎵",
        calculate: bytes => bytes / (assumptions.songMB * 1000000),
        format: value => `${formatNumber(value)} songs`,
        description: `Using ${assumptions.songMB} MB per song.`
    },

    {
        name: "Years of music",
        icon: "🎧",
        calculate: bytes =>
            (bytes / (assumptions.songMB * 1000000) * 3.5) /
            (24 * 365),
        format: value => `${formatNumber(value, 2)} years of music`,
        description: "Assuming roughly 3.5 minutes per song."
    }
];

/* =========================================================
   ENERGY COMPARISONS
   ========================================================= */

const energyComparisons = [
    {
        name: "Phone charges",
        icon: "📱",
        calculate: joules => joules / (assumptions.phoneChargeWh * 3600),
        format: value => `${formatNumber(value)} phone charges`,
        description: `Using roughly ${assumptions.phoneChargeWh} Wh per charge.`
    },

    {
        name: "Kettle boils",
        icon: "☕",
        calculate: joules => joules / (assumptions.kettleWh * 3600),
        format: value => `${formatNumber(value)} kettle boils`,
        description: `Using roughly ${assumptions.kettleWh} Wh per boil.`
    },

    {
        name: "Showers",
        icon: "🚿",
        calculate: joules =>
            joules / (assumptions.showerKWh * 3600000),
        format: value => `${formatNumber(value)} showers`,
        description: `Using roughly ${assumptions.showerKWh} kWh per shower.`
    },

    {
        name: "LED bulb hours",
        icon: "💡",
        calculate: joules =>
            joules / (assumptions.ledWatts * 3600),
        format: value => `${formatNumber(value)} hours of LED lighting`,
        description: `Using a ${assumptions.ledWatts} W LED bulb.`
    },

    {
        name: "Electric car miles",
        icon: "🚗",
        calculate: joules =>
            joules / (assumptions.evWhPerMile * 3600),
        format: value => `${formatNumber(value)} electric-car miles`,
        description: `Using roughly ${assumptions.evWhPerMile} Wh per mile.`
    }
];

/* =========================================================
   CATEGORY COMPARISON MAP
   ========================================================= */

const comparisonMap = {
    time: timeComparisons,
    money: moneyComparisons,
    distance: distanceComparisons,
    weight: weightComparisons,
    calories: calorieComparisons,
    data: dataComparisons,
    energy: energyComparisons
};

/* =========================================================
   DOM ELEMENT LOOKUPS
   ========================================================= */

const input = $("#converter-input");
const unitSelect = $("#unit-select");
const categorySelect = $("#category-select");
const convertButton = $("#convert-button");
const resultsContainer = $("#results");
const comparisonsContainer = $("#comparisons");
const comparisonSection = $("#comparison-section");
const inputLabel = $("#input-label");
const resultTitle = $("#result-title");
const resultSubtitle = $("#result-subtitle");
const shareButton = $("#share-button");
const copyButton = $("#copy-button");
const surpriseButton = $("#surprise-button");
const chaosButton = $("#chaos-button");
const examplesContainer = $("#examples");
const assumptionsPanel = $("#assumptions");
const assumptionsToggle = $("#assumptions-toggle");
const toast = $("#toast");

/* =========================================================
   UNIT LISTS
   ========================================================= */

function populateUnits(category) {
    if (!unitSelect) return;

    unitSelect.innerHTML = "";

    const units = conversions[category];

    Object.entries(units).forEach(([key, definition]) => {
        const option = document.createElement("option");

        option.value = key;
        option.textContent = definition.label;

        unitSelect.appendChild(option);
    });

    if (category === state.category && units[state.unit]) {
        unitSelect.value = state.unit;
    } else {
        state.unit = Object.keys(units)[0];
        unitSelect.value = state.unit;
    }
}

/* =========================================================
   CATEGORY DETECTION
   ========================================================= */

function getCategoryFromUnit(unit) {
    for (const [category, units] of Object.entries(conversions)) {
        if (units[unit]) return category;
    }

    return "time";
}

/* =========================================================
   BASE CONVERSION
   ========================================================= */

function convertToBase(category, value, unit) {
    if (category === "money") {
        return value;
    }

    const definition = conversions[category]?.[unit];

    if (!definition || typeof definition.toBase !== "function") {
        return value;
    }

    return definition.toBase(value);
}

/* =========================================================
   TIME RESULT GENERATION
   ========================================================= */

function generateTimeResults(seconds, originalUnit, originalValue) {
    const results = [];

    const units = [
        ["seconds", seconds],
        ["minutes", seconds / 60],
        ["hours", seconds / 3600],
        ["days", seconds / 86400],
        ["weeks", seconds / 604800],
        ["months", seconds / 2629800],
        ["years", seconds / 31557600],
        ["decades", seconds / 315576000],
        ["centuries", seconds / 3155760000]
    ];

    const originalIndex = units.findIndex(([unit]) => unit === originalUnit);

    units.forEach(([unit, value], index) => {
        if (!Number.isFinite(value)) return;

        // Keep useful conversions around the original scale.
        // Avoid overwhelming the page with microscopic values.
        if (value < 0.0001 && index > originalIndex) return;

        if (index === originalIndex) return;

        results.push({
            type: "conversion",
            value,
            unit: conversions.time[unit]?.label || unit,
            short: conversions.time[unit]?.short || unit,
            description: getTimeDescription(unit, value)
        });
    });

    // Keep the most useful progression.
    return selectUsefulResults(results, 6);
}

function getTimeDescription(unit, value) {
    switch (unit) {
        case "seconds":
            return "A very small slice of time.";

        case "minutes":
            return "How long it lasts in minutes.";

        case "hours":
            return "A more human-scale view.";

        case "days":
            return "Enough time to notice."

        case "weeks":
            return "Now we're talking in weeks.";

        case "months":
            return "Using an average month of about 30.44 days.";

        case "years":
            return "A full trip around the calendar.";

        case "decades":
            return "Ten-year chunks.";

        case "centuries":
            return "One century is 100 years.";

        default:
            return "";
    }
}

/* =========================================================
   GENERIC RESULT GENERATION
   ========================================================= */

function generateResults(category, value, unit) {
    if (category === "time") {
        const seconds = convertToBase(category, value, unit);
        return generateTimeResults(seconds, unit, value);
    }

    if (category === "distance") {
        const metres = convertToBase(category, value, unit);

        return [
            {
                type: "conversion",
                value: metres / 1000,
                unit: "Kilometres",
                short: "km",
                description: "A metric view of the same distance."
            },
            {
                type: "conversion",
                value: metres / 1609.344,
                unit: "Miles",
                short: "mi",
                description: "The equivalent distance in miles."
            },
            {
                type: "conversion",
                value: metres / 0.3048,
                unit: "Feet",
                short: "ft",
                description: "The same distance measured in feet."
            },
            {
                type: "conversion",
                value: metres / 0.9144,
                unit: "Yards",
                short: "yd",
                description: "The same distance measured in yards."
            }
        ].filter(result => result.value >= 0.0001);
    }

    if (category === "weight") {
        const grams = convertToBase(category, value, unit);

        return [
            {
                type: "conversion",
                value: grams / 1000,
                unit: "Kilograms",
                short: "kg",
                description: "The metric weight most people use day to day."
            },
            {
                type: "conversion",
                value: grams / 453.59237,
                unit: "Pounds",
                short: "lb",
                description: "The equivalent weight in pounds."
            },
            {
                type: "conversion",
                value: grams / 28.349523125,
                unit: "Ounces",
                short: "oz",
                description: "The same weight in ounces."
            },
            {
                type: "conversion",
                value: grams / 1000000,
                unit: "Tonnes",
                short: "t",
                description: "Useful for much larger weights."
            }
        ].filter(result => result.value >= 0.0001);
    }

    if (category === "data") {
        const bytes = convertToBase(category, value, unit);

        return [
            {
                type: "conversion",
                value: bytes / 1000,
                unit: "Kilobytes",
                short: "KB",
                description: "1,000 bytes per kilobyte."
            },
            {
                type: "conversion",
                value: bytes / 1000000,
                unit: "Megabytes",
                short: "MB",
                description: "1,000,000 bytes per megabyte."
            },
            {
                type: "conversion",
                value: bytes / 1000000000,
                unit: "Gigabytes",
                short: "GB",
                description: "1 billion bytes per gigabyte."
            },
            {
                type: "conversion",
                value: bytes / 1000000000000,
                unit: "Terabytes",
                short: "TB",
                description: "1 trillion bytes per terabyte."
            }
        ].filter(result => result.value >= 0.0001);
    }

    if (category === "energy") {
        const joules = convertToBase(category, value, unit);

        return [
            {
                type: "conversion",
                value: joules / 4184,
                unit: "Calories",
                short: "kcal",
                description: "The nutritional-energy equivalent."
            },
            {
                type: "conversion",
                value: joules / 3600000,
                unit: "Kilowatt-hours",
                short: "kWh",
                description: "The unit commonly used on electricity bills."
            },
            {
                type: "conversion",
                value: joules / 1000,
                unit: "Kilojoules",
                short: "kJ",
                description: "The metric energy unit."
            }
        ].filter(result => result.value >= 0.0001);
    }

    if (category === "calories") {
        return [
            {
                type: "conversion",
                value: value / 2500,
                unit: "Days at 2,500 kcal",
                short: "days",
                description: "A simplified daily-energy reference."
            },
            {
                type: "conversion",
                value: value / 590,
                unit: "Big Macs",
                short: "Big Macs",
                description: "Approximate energy equivalent."
            },
            {
                type: "conversion",
                value: value / 230,
                unit: "Chocolate bars",
                short: "bars",
                description: "Approximate energy equivalent."
            }
        ];
    }

    if (category === "money") {
        return [];
    }

    return [];
}

/* =========================================================
   RESULT FILTERING
   ========================================================= */

function selectUsefulResults(results, maxResults = 6) {
    if (results.length <= maxResults) return results;

    return results
        .filter(result => Number.isFinite(result.value))
        .sort((a, b) => a.value - b.value)
        .slice(0, maxResults);
}

/* =========================================================
   ORIGINAL INPUT CARD
   ========================================================= */

function getOriginalDisplay(category, value, unit) {
    if (category === "money") {
        const currency = conversions.money[unit]?.currency || "GBP";

        return formatMoney(value, currency);
    }

    if (category === "calories") {
        return `${formatNumber(value)} calories`;
    }

    const definition = conversions[category]?.[unit];

    return `${formatNumber(value)} ${definition?.label?.toLowerCase() || unit}`;
}

/* =========================================================
   RENDER RESULT JOURNEY
   ========================================================= */

function renderResults(category, value, unit) {
    if (!resultsContainer) return;

    const results = generateResults(category, value, unit);

    state.lastResults = results;

    resultsContainer.innerHTML = "";

    const original = document.createElement("div");
    original.className = "result-step result-original";

    original.innerHTML = `
        <div class="result-category">YOU ENTERED</div>
        <div class="result-value">
            ${escapeHTML(getOriginalDisplay(category, value, unit))}
        </div>
    `;

    resultsContainer.appendChild(original);

    results.forEach((result, index) => {
        const arrow = document.createElement("div");
        arrow.className = "result-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.innerHTML = "↓";

        resultsContainer.appendChild(arrow);

        const step = document.createElement("article");
        step.className = "result-step";
        step.style.animationDelay = `${index * 70}ms`;

        step.innerHTML = `
            <div class="result-category">
                ${escapeHTML(categoryMeta[category]?.title || category)}
            </div>

            <div class="result-value">
                ${escapeHTML(formatNumber(result.value))}
                <span>${escapeHTML(result.short)}</span>
            </div>

            <div class="result-label">
                ${escapeHTML(result.unit)}
            </div>

            <p class="result-description">
                ${escapeHTML(result.description || "")}
            </p>
        `;

        resultsContainer.appendChild(step);
    });

    if (resultTitle) {
        resultTitle.textContent =
            category === "money"
                ? "Here's what that money looks like."
                : "Here's what that actually means.";
    }

    if (resultSubtitle) {
        resultSubtitle.textContent =
            categoryMeta[category]?.description || "";
    }

    renderComparisons(category, value, unit);

    resultsContainer.classList.add("results-visible");

    requestAnimationFrame(() => {
        resultsContainer.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}

/* =========================================================
   COMPARISONS
   ========================================================= */

function getComparisonBase(category, value, unit) {
    if (category === "time") {
        return convertToBase(category, value, unit);
    }

    if (category === "distance") {
        return convertToBase(category, value, unit);
    }

    if (category === "weight") {
        return convertToBase(category, value, unit);
    }

    if (category === "data") {
        return convertToBase(category, value, unit);
    }

    if (category === "energy") {
        return convertToBase(category, value, unit);
    }

    if (category === "calories") {
        return value;
    }

    if (category === "money") {
        return value;
    }

    return value;
}

function renderComparisons(category, value, unit) {
    if (!comparisonsContainer) return;

    const comparisonDefinitions = comparisonMap[category] || [];

    const baseValue = getComparisonBase(category, value, unit);

    state.lastComparisonResults = [];

    comparisonsContainer.innerHTML = "";

    comparisonDefinitions.forEach((comparison, index) => {
        const calculated = comparison.calculate(baseValue);

        if (!Number.isFinite(calculated) || calculated <= 0) return;

        const item = {
            ...comparison,
            value: calculated,
            resultText: comparison.format(calculated)
        };

        state.lastComparisonResults.push(item);

        const card = document.createElement("article");
        card.className = "comparison-card";
        card.style.animationDelay = `${index * 70}ms`;

        card.innerHTML = `
            <div class="comparison-icon" aria-hidden="true">
                ${comparison.icon}
            </div>

            <div class="comparison-content">
                <div class="comparison-name">
                    ${escapeHTML(comparison.name)}
                </div>

                <div class="comparison-result">
                    ${escapeHTML(comparison.format(calculated))}
                </div>

                <p>
                    ${escapeHTML(comparison.description)}
                </p>
            </div>
        `;

        comparisonsContainer.appendChild(card);
    });

    if (comparisonSection) {
        comparisonSection.hidden = state.lastComparisonResults.length === 0;
    }
}

/* =========================================================
   CHAOS MODE
   ========================================================= */

function showRandomComparison() {
    if (!state.lastComparisonResults.length) return;

    const comparison =
        state.lastComparisonResults[
            Math.floor(Math.random() * state.lastComparisonResults.length)
        ];

    const existing = document.querySelector(".chaos-result");

    if (existing) existing.remove();

    const chaos = document.createElement("div");
    chaos.className = "chaos-result";

    chaos.innerHTML = `
        <div class="chaos-label">OKAY... BUT WHAT DOES THAT MEAN?</div>

        <div class="chaos-icon">
            ${comparison.icon}
        </div>

        <div class="chaos-result-text">
            ${escapeHTML(comparison.resultText)}
        </div>

        <p>
            ${escapeHTML(comparison.description)}
        </p>
    `;

    if (comparisonSection) {
        comparisonSection.appendChild(chaos);
    } else if (resultsContainer) {
        resultsContainer.appendChild(chaos);
    }

    chaos.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

/* =========================================================
   MONEY ASSUMPTIONS
   ========================================================= */

function readAssumptionInput(id, property) {
    const element = document.querySelector(`#${id}`);

    if (!element) return;

    const value = Number(element.value);

    if (Number.isFinite(value) && value > 0) {
        assumptions[property] = value;
    }
}

function setupAssumptions() {
    const mappings = {
        assumptionWage: "wage",
        assumptionCoffee: "coffee",
        assumptionMeal: "meal",
        assumptionSubscription: "subscription",
        assumptionRent: "rentPerDay",
        assumptionConsole: "console",
        assumptionBigMac: "bigMac",
        assumptionCinema: "cinema",
        assumptionPetrol: "petrolPerLitre",
        assumptionFlight: "flight",
        assumptionPhone: "phone"
    };

    Object.entries(mappings).forEach(([id, property]) => {
        const element = document.getElementById(id);

        if (!element) return;

        element.value = assumptions[property];

        element.addEventListener("input", () => {
            readAssumptionInput(id, property);

            if (state.lastInput) {
                renderComparisons(
                    state.lastInput.category,
                    state.lastInput.value,
                    state.lastInput.unit
                );
            }
        });
    });
}

/* =========================================================
   CONVERSION EXECUTION
   ========================================================= */

function runConversion() {
    if (!input) return;

    const raw = input.value
        .replace(/,/g, "")
        .replace(/£/g, "")
        .trim();

    const value = Number(raw);

    if (!Number.isFinite(value) || value < 0) {
        showToast("Enter a valid number.");
        input.focus();
        return;
    }

    const category =
        categorySelect?.value ||
        state.category ||
        getCategoryFromUnit(unitSelect?.value);

    const unit =
        unitSelect?.value ||
        state.unit;

    state.category = category;
    state.unit = unit;
    state.value = value;

    state.lastInput = {
        category,
        unit,
        value
    };

    updateURL();

    renderResults(category, value, unit);
}

/* =========================================================
   URL SHARING
   ========================================================= */

function updateURL() {
    const params = new URLSearchParams();

    params.set("value", state.value);
    params.set("unit", state.unit);
    params.set("category", state.category);

    const newURL =
        `${window.location.pathname}?${params.toString()}`;

    window.history.replaceState({}, "", newURL);
}

function loadFromURL() {
    const params = new URLSearchParams(window.location.search);

    const value = Number(params.get("value"));
    const unit = params.get("unit");
    const category = params.get("category");

    if (
        !Number.isFinite(value) ||
        value < 0 ||
        !category ||
        !conversions[category]
    ) {
        return false;
    }

    state.category = category;

    if (categorySelect) {
        categorySelect.value = category;
    }

    populateUnits(category);

    if (unit && conversions[category]?.[unit]) {
        state.unit = unit;

        if (unitSelect) {
            unitSelect.value = unit;
        }
    }

    if (input) {
        input.value = value;
    }

    state.value = value;

    return true;
}

/* =========================================================
   COPY / SHARE
   ========================================================= */

function createShareText() {
    if (!state.lastInput) return "";

    const { category, value, unit } = state.lastInput;

    const original = getOriginalDisplay(category, value, unit);

    const comparisonText = state.lastComparisonResults
        .slice(0, 4)
        .map(item => item.resultText)
        .join(" = ");

    return comparisonText
        ? `${original} = ${comparisonText}`
        : original;
}

async function copyResult() {
    const text = createShareText();

    if (!text) {
        showToast("Convert something first.");
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        showToast("Result copied.");
    } catch {
        fallbackCopy(text);
    }
}

async function shareResult() {
    if (!state.lastInput) {
        showToast("Convert something first.");
        return;
    }

    const shareData = {
        title: "Everything Converter",
        text: createShareText(),
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            return;
        } catch (error) {
            if (error?.name === "AbortError") return;
        }
    }

    await copyResult();
}

function fallbackCopy(text) {
    const textarea = document.createElement("textarea");

    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand("copy");
        showToast("Result copied.");
    } catch {
        showToast("Copy failed.");
    }

    textarea.remove();
}

/* =========================================================
   SURPRISE ME
   ========================================================= */

const surprisePresets = [
    {
        category: "time",
        value: 1000000,
        unit: "seconds"
    },

    {
        category: "time",
        value: 10000,
        unit: "hours"
    },

    {
        category: "money",
        value: 100,
        unit: "GBP"
    },

    {
        category: "money",
        value: 1000,
        unit: "GBP"
    },

    {
        category: "distance",
        value: 500,
        unit: "miles"
    },

    {
        category: "distance",
        value: 10,
        unit: "miles"
    },

    {
        category: "weight",
        value: 100,
        unit: "kilograms"
    },

    {
        category: "calories",
        value: 10000,
        unit: "calories"
    },

    {
        category: "data",
        value: 1,
        unit: "terabytes"
    },

    {
        category: "energy",
        value: 1,
        unit: "kilowattHours"
    }
];

function surpriseMe() {
    const preset =
        surprisePresets[
            Math.floor(Math.random() * surprisePresets.length)
        ];

    if (categorySelect) {
        categorySelect.value = preset.category;
    }

    populateUnits(preset.category);

    if (unitSelect) {
        unitSelect.value = preset.unit;
    }

    if (input) {
        input.value = preset.value;
    }

    runConversion();
}

/* =========================================================
   EXAMPLE BUTTONS
   ========================================================= */

const examplePresets = [
    {
        label: "10,000 hours",
        category: "time",
        value: 10000,
        unit: "hours"
    },

    {
        label: "£1,000",
        category: "money",
        value: 1000,
        unit: "GBP"
    },

    {
        label: "500 miles",
        category: "distance",
        value: 500,
        unit: "miles"
    },

    {
        label: "1 TB",
        category: "data",
        value: 1,
        unit: "terabytes"
    },

    {
        label: "10,000 calories",
        category: "calories",
        value: 10000,
        unit: "calories"
    }
];

function setupExamples() {
    if (!examplesContainer) return;

    examplesContainer.innerHTML = "";

    examplePresets.forEach(example => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "example-chip";
        button.textContent = example.label;

        button.addEventListener("click", () => {
            if (categorySelect) {
                categorySelect.value = example.category;
            }

            populateUnits(example.category);

            if (unitSelect) {
                unitSelect.value = example.unit;
            }

            if (input) {
                input.value = example.value;
            }

            runConversion();
        });

        examplesContainer.appendChild(button);
    });
}

/* =========================================================
   CATEGORY EVENTS
   ========================================================= */

function setupCategoryEvents() {
    if (!categorySelect) return;

    categorySelect.addEventListener("change", () => {
        const category = categorySelect.value;

        state.category = category;

        populateUnits(category);

        const firstUnit = Object.keys(conversions[category])[0];

        state.unit = firstUnit;

        if (unitSelect) {
            unitSelect.value = firstUnit;
        }

        updateInputLabel(category);
    });
}

function updateInputLabel(category) {
    if (!inputLabel) return;

    const meta = categoryMeta[category];

    inputLabel.textContent =
        meta?.title
            ? `${meta.title} amount`
            : "Amount";
}

/* =========================================================
   ASSUMPTIONS PANEL
   ========================================================= */

function setupAssumptionsToggle() {
    if (!assumptionsToggle || !assumptionsPanel) return;

    assumptionsToggle.addEventListener("click", () => {
        const expanded =
            assumptionsToggle.getAttribute("aria-expanded") === "true";

        assumptionsToggle.setAttribute(
            "aria-expanded",
            String(!expanded)
        );

        assumptionsPanel.classList.toggle("is-open", !expanded);
    });
}

/* =========================================================
   TOAST
   ========================================================= */

let toastTimeout;

function showToast(message) {
    if (!toast) {
        console.log(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

/* =========================================================
   KEYBOARD SUPPORT
   ========================================================= */

function setupKeyboard() {
    if (!input) return;

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            runConversion();
        }
    });
}

/* =========================================================
   DARK / LIGHT MODE
   ========================================================= */

function setupTheme() {
    const themeButton =
        $("#theme-toggle") ||
        $("[data-theme-toggle]");

    if (!themeButton) return;

    const storedTheme =
        localStorage.getItem("everything-converter-theme");

    if (storedTheme) {
        document.documentElement.dataset.theme = storedTheme;
    }

    themeButton.addEventListener("click", () => {
        const current =
            document.documentElement.dataset.theme || "dark";

        const next =
            current === "dark"
                ? "light"
                : "dark";

        document.documentElement.dataset.theme = next;

        localStorage.setItem(
            "everything-converter-theme",
            next
        );
    });
}

/* =========================================================
   SMOOTH NUMBER ANIMATION
   ========================================================= */

function animateNumbers() {
    const numberElements =
        $$(".count-up");

    numberElements.forEach(element => {
        const target = Number(element.dataset.target);

        if (!Number.isFinite(target)) return;

        const duration = 650;
        const startTime = performance.now();

        function frame(now) {
            const progress =
                clamp(
                    (now - startTime) / duration,
                    0,
                    1
                );

            const eased =
                1 - Math.pow(1 - progress, 3);

            const current =
                target * eased;

            element.textContent =
                formatNumber(current);

            if (progress < 1) {
                requestAnimationFrame(frame);
            }
        }

        requestAnimationFrame(frame);
    });
}

/* =========================================================
   EXPLORE PRESETS
   ========================================================= */

function setupExplorePresets() {
    const presetElements =
        $("[data-convert-value]");

    if (!presetElements) return;

    $$( "[data-convert-value]" ).forEach(element => {
        element.addEventListener("click", () => {
            const value = Number(
                element.dataset.convertValue
            );

            const category =
                element.dataset.convertCategory;

            const unit =
                element.dataset.convertUnit;

            if (
                !Number.isFinite(value) ||
                !category ||
                !unit
            ) {
                return;
            }

            if (categorySelect) {
                categorySelect.value = category;
            }

            populateUnits(category);

            if (unitSelect) {
                unitSelect.value = unit;
            }

            if (input) {
                input.value = value;
            }

            runConversion();
        });
    });
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {
    $$("a[href^='#']").forEach(link => {
        link.addEventListener("click", event => {
            const targetID =
                link.getAttribute("href");

            if (!targetID || targetID === "#") return;

            const target =
                document.querySelector(targetID);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
}

/* =========================================================
   FORMATTING CATEGORY-SPECIFIC OUTPUT
   ========================================================= */

function getUnitDisplay(category, unit) {
    if (category === "money") {
        return conversions.money[unit]?.short || unit;
    }

    if (category === "calories") {
        return "kcal";
    }

    return conversions[category]?.[unit]?.short || unit;
}

/* =========================================================
   MONEY CURRENCY NOTE
   ========================================================= */

function renderCurrencyNotice() {
    const notice =
        $("#currency-notice");

    if (!notice) return;

    if (state.category === "money") {
        notice.hidden = false;
        notice.textContent =
            "Currency comparisons use editable assumptions. Live exchange rates are not required.";
    } else {
        notice.hidden = true;
    }
}

/* =========================================================
   VALIDATION
   ========================================================= */

function validateInput() {
    if (!input) return false;

    const value =
        Number(
            input.value
                .replace(/,/g, "")
                .trim()
        );

    if (!Number.isFinite(value)) {
        input.setAttribute("aria-invalid", "true");
        return false;
    }

    input.removeAttribute("aria-invalid");

    return true;
}

/* =========================================================
   MAIN INITIALISATION
   ========================================================= */

function init() {
    if (categorySelect) {
        categorySelect.value = state.category;
    }

    populateUnits(state.category);

    setupCategoryEvents();
    setupExamples();
    setupAssumptions();
    setupAssumptionsToggle();
    setupKeyboard();
    setupTheme();
    setupExplorePresets();
    setupNavigation();

    if (convertButton) {
        convertButton.addEventListener("click", () => {
            if (!validateInput()) {
                showToast("Enter a valid number.");
                return;
            }

            runConversion();
        });
    }

    if (shareButton) {
        shareButton.addEventListener("click", shareResult);
    }

    if (copyButton) {
        copyButton.addEventListener("click", copyResult);
    }

    if (chaosButton) {
        chaosButton.addEventListener(
            "click",
            showRandomComparison
        );
    }

    if (surpriseButton) {
        surpriseButton.addEventListener(
            "click",
            surpriseMe
        );
    }

    if (unitSelect) {
        unitSelect.addEventListener("change", () => {
            state.unit = unitSelect.value;
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener("change", renderCurrencyNotice);
    }

    const loadedFromURL = loadFromURL();

    if (loadedFromURL) {
        renderCurrencyNotice();
        runConversion();
    } else {
        renderCurrencyNotice();
    }

    animateNumbers();
}

/* =========================================================
   START
   ========================================================= */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}