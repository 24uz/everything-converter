"use strict";

/*
    EVERYTHING CONVERTER
    --------------------
    Client-side conversion engine.

    No frameworks.
    No backend.
    No API required.

    Currency values are intentionally assumption-based.
    If you later want live exchange rates, the currency section
    can be replaced with an API without changing the rest
    of the application.
*/

/* ============================================================
   DOM
============================================================ */

const input = document.getElementById("valueInput");
const unitSelect = document.getElementById("unitSelect");
const convertButton = document.getElementById("convertButton");

const resultsSection = document.getElementById("resultsSection");
const resultChain = document.getElementById("resultChain");
const chaosGrid = document.getElementById("chaosGrid");

const toast = document.getElementById("toast");

const themeButton = document.getElementById("themeToggle");

const copyTextButton = document.getElementById("copyText");
const copyLinkButton = document.getElementById("copyLink");
const shareButton = document.getElementById("shareButton");

const surpriseButton = document.getElementById("surpriseButton");

const assumptionInputs = {
    wage: document.getElementById("wage"),
    coffee: document.getElementById("coffee"),
    takeaway: document.getElementById("takeaway"),
    subscription: document.getElementById("subscription"),
    rent: document.getElementById("rent"),
    console: document.getElementById("console"),
    bigmac: document.getElementById("bigmac"),
    cinema: document.getElementById("cinema"),
    petrol: document.getElementById("petrol")
};

/* ============================================================
   CONSTANTS
============================================================ */

const CONSTANTS = {
    averageMonthDays: 30.436875,
    averageYearDays: 365.2425,

    // Approximate Earth circumference.
    earthCircumferenceKm: 40075,

    // Common reference estimates.
    stepsPerKm: 1312,
    marathonKm: 42.195,
    footballPitchM2: 7140,

    // Weight.
    sugarBagKg: 1,
    waterKgPerLitre: 1,

    // Data.
    photoMB: 4,
    hdFilmGB: 5,
    songMB: 5,

    // Energy.
    phoneChargeKwh: 0.015,
    kettleBoilKwh: 0.1,
    showerKwh: 1.5,
    ledBulbWatts: 10,
    electricCarKwhPerMile: 0.28
};

/* ============================================================
   HELPERS
============================================================ */

function getNumber(id, fallback) {
    const element = document.getElementById(id);

    if (!element) {
        return fallback;
    }

    const value = Number(element.value);

    return Number.isFinite(value) && value > 0
        ? value
        : fallback;
}

function getAssumptions() {
    return {
        wage: getNumber("wage", 13.0),
        coffee: getNumber("coffee", 2.5),
        takeaway: getNumber("takeaway", 10),
        subscription: getNumber("subscription", 10.99),
        rent: getNumber("rent", 30),
        console: getNumber("console", 479.99),
        bigmac: getNumber("bigmac", 5.49),
        cinema: getNumber("cinema", 12),
        petrol: getNumber("petrol", 1.45)
    };
}

function formatNumber(value, maxDecimals = 2) {
    if (!Number.isFinite(value)) {
        return "—";
    }

    const absolute = Math.abs(value);

    let decimals = maxDecimals;

    if (absolute >= 1000000) {
        decimals = 0;
    } else if (absolute >= 1000) {
        decimals = Math.min(decimals, 1);
    } else if (absolute >= 100) {
        decimals = Math.min(decimals, 1);
    } else if (absolute >= 10) {
        decimals = Math.min(decimals, 2);
    }

    return new Intl.NumberFormat("en-GB", {
        maximumFractionDigits: decimals
    }).format(value);
}

function formatMoney(value, currency = "GBP") {
    const symbols = {
        GBP: "£",
        USD: "$",
        EUR: "€"
    };

    const symbol = symbols[currency] || currency;

    return `${symbol}${formatNumber(value, 2)}`;
}

function cleanUnitName(unit) {
    return unit
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}

function showToast(message) {
    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

function scrollToResults() {
    if (!resultsSection) {
        return;
    }

    resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* ============================================================
   CONVERSION DEFINITIONS
============================================================ */

/*
    Each unit has a multiplier that converts the unit
    into the category's base unit.
*/

const conversions = {
    time: {
        seconds: {
            label: "Seconds",
            short: "sec",
            toBase: 1
        },

        minutes: {
            label: "Minutes",
            short: "min",
            toBase: 60
        },

        hours: {
            label: "Hours",
            short: "hr",
            toBase: 3600
        },

        days: {
            label: "Days",
            short: "day",
            toBase: 86400
        },

        weeks: {
            label: "Weeks",
            short: "week",
            toBase: 604800
        },

        months: {
            label: "Months",
            short: "month",
            toBase: CONSTANTS.averageMonthDays * 86400
        },

        years: {
            label: "Years",
            short: "year",
            toBase: CONSTANTS.averageYearDays * 86400
        },

        decades: {
            label: "Decades",
            short: "decade",
            toBase: CONSTANTS.averageYearDays * 86400 * 10
        },

        centuries: {
            label: "Centuries",
            short: "century",
            toBase: CONSTANTS.averageYearDays * 86400 * 100
        }
    },

    distance: {
        metres: {
            label: "Metres",
            short: "m",
            toBase: 1
        },

        kilometres: {
            label: "Kilometres",
            short: "km",
            toBase: 1000
        },

        miles: {
            label: "Miles",
            short: "mi",
            toBase: 1609.344
        },

        yards: {
            label: "Yards",
            short: "yd",
            toBase: 0.9144
        },

        feet: {
            label: "Feet",
            short: "ft",
            toBase: 0.3048
        }
    },

    weight: {
        grams: {
            label: "Grams",
            short: "g",
            toBase: 1
        },

        kilograms: {
            label: "Kilograms",
            short: "kg",
            toBase: 1000
        },

        pounds: {
            label: "Pounds",
            short: "lb",
            toBase: 453.59237
        },

        ounces: {
            label: "Ounces",
            short: "oz",
            toBase: 28.349523125
        },

        tonnes: {
            label: "Tonnes",
            short: "tonne",
            toBase: 1000000
        }
    },

    calories: {
        calories: {
            label: "Calories",
            short: "kcal",
            toBase: 1
        },

        kilocalories: {
            label: "Kilocalories",
            short: "kcal",
            toBase: 1
        },

        joules: {
            label: "Joules",
            short: "J",
            toBase: 1 / 4184
        },

        kilojoules: {
            label: "Kilojoules",
            short: "kJ",
            toBase: 1 / 4.184
        }
    },

    data: {
        bytes: {
            label: "Bytes",
            short: "B",
            toBase: 1
        },

        kilobytes: {
            label: "Kilobytes",
            short: "KB",
            toBase: 1000
        },

        megabytes: {
            label: "Megabytes",
            short: "MB",
            toBase: 1000000
        },

        gigabytes: {
            label: "Gigabytes",
            short: "GB",
            toBase: 1000000000
        },

        terabytes: {
            label: "Terabytes",
            short: "TB",
            toBase: 1000000000000
        },

        petabytes: {
            label: "Petabytes",
            short: "PB",
            toBase: 1000000000000000
        }
    },

    energy: {
        joules: {
            label: "Joules",
            short: "J",
            toBase: 1
        },

        kilojoules: {
            label: "Kilojoules",
            short: "kJ",
            toBase: 1000
        },

        watt_hours: {
            label: "Watt-hours",
            short: "Wh",
            toBase: 3600
        },

        kilowatt_hours: {
            label: "Kilowatt-hours",
            short: "kWh",
            toBase: 3600000
        },

        calories: {
            label: "Calories",
            short: "kcal",
            toBase: 4184
        }
    }
};

/* ============================================================
   UNIT LOOKUP
============================================================ */

const unitCategories = {
    hours: "time",
    seconds: "time",
    minutes: "time",
    days: "time",
    weeks: "time",
    months: "time",
    years: "time",
    decades: "time",
    centuries: "time",

    metres: "distance",
    kilometres: "distance",
    miles: "distance",
    yards: "distance",
    feet: "distance",

    grams: "weight",
    kilograms: "weight",
    pounds: "weight",
    ounces: "weight",
    tonnes: "weight",

    calories: "calories",
    kilocalories: "calories",
    joules: "calories",
    kilojoules: "calories",

    bytes: "data",
    kilobytes: "data",
    megabytes: "data",
    gigabytes: "data",
    terabytes: "data",
    petabytes: "data",

    energy_joules: "energy",
    energy_kilojoules: "energy",
    watt_hours: "energy",
    kilowatt_hours: "energy"
};

/* ============================================================
   CATEGORY RESULT DEFINITIONS
============================================================ */

const categoryChains = {
    time: [
        "minutes",
        "hours",
        "days",
        "weeks",
        "months",
        "years"
    ],

    distance: [
        "metres",
        "kilometres",
        "miles"
    ],

    weight: [
        "kilograms",
        "pounds",
        "tonnes"
    ],

    calories: [
        "kilocalories",
        "kilojoules"
    ],

    data: [
        "megabytes",
        "gigabytes",
        "terabytes"
    ],

    energy: [
        "kilojoules",
        "watt_hours",
        "kilowatt_hours"
    ]
};

/* ============================================================
   COMPARISON DEFINITIONS
============================================================ */

/*
    Comparison definitions are intentionally kept separate
    from the calculation engine so new comparisons can be
    added easily.
*/

const comparisonDefinitions = {
    time: [
        {
            name: "One-minute songs",
            emoji: "🎧",
            calculate: seconds => seconds / 60,
            format: value => `${formatNumber(value)} one-minute songs`,
            note: "If each song lasted exactly one minute."
        },

        {
            name: "Two-hour films",
            emoji: "🎬",
            calculate: seconds => seconds / 7200,
            format: value => `${formatNumber(value)} two-hour films`,
            note: "Assuming a two-hour runtime per film."
        },

        {
            name: "Sleeping hours",
            emoji: "😴",
            calculate: seconds => seconds / 28800,
            format: value => `${formatNumber(value)} eight-hour sleeps`,
            note: "An eight-hour sleep is used as the reference."
        },

        {
            name: "Working days",
            emoji: "💼",
            calculate: seconds => seconds / 28800,
            format: value => `${formatNumber(value)} eight-hour workdays`,
            note: "Excludes weekends and holidays."
        },

        {
            name: "Weekends",
            emoji: "🗓️",
            calculate: seconds => seconds / 172800,
            format: value => `${formatNumber(value)} full weekends`,
            note: "Two full days per weekend."
        }
    ],

    money: [
        {
            name: "Coffees",
            emoji: "☕",
            calculate: (value, assumptions) =>
                value / assumptions.coffee,
            format: value => `${formatNumber(value)} coffees`,
            note: "Based on your coffee price assumption."
        },

        {
            name: "Takeaway meals",
            emoji: "🍔",
            calculate: (value, assumptions) =>
                value / assumptions.takeaway,
            format: value => `${formatNumber(value)} takeaway meals`,
            note: "Based on your takeaway assumption."
        },

        {
            name: "Months of subscription",
            emoji: "📺",
            calculate: (value, assumptions) =>
                value / assumptions.subscription,
            format: value => `${formatNumber(value)} months`,
            note: "Based on your monthly subscription assumption."
        },

        {
            name: "Days of rent",
            emoji: "🏠",
            calculate: (value, assumptions) =>
                value / assumptions.rent,
            format: value => `${formatNumber(value)} days`,
            note: "Based on your daily rent assumption."
        },

        {
            name: "Game consoles",
            emoji: "🎮",
            calculate: (value, assumptions) =>
                value / assumptions.console,
            format: value => `${formatNumber(value)} consoles`,
            note: "Based on your console price assumption."
        },

        {
            name: "Big Macs",
            emoji: "🍟",
            calculate: (value, assumptions) =>
                value / assumptions.bigmac,
            format: value => `${formatNumber(value)} Big Macs`,
            note: "Based on your Big Mac price assumption."
        },

        {
            name: "Cinema tickets",
            emoji: "🎟️",
            calculate: (value, assumptions) =>
                value / assumptions.cinema,
            format: value => `${formatNumber(value)} cinema tickets`,
            note: "Based on your cinema ticket assumption."
        }
    ],

    distance: [
        {
            name: "Steps",
            emoji: "👟",
            calculate: metres =>
                (metres / 1000) * CONSTANTS.stepsPerKm,
            format: value => `≈ ${formatNumber(value)} steps`,
            note: "Very rough estimate based on 1,312 steps per kilometre."
        },

        {
            name: "Marathons",
            emoji: "🏃",
            calculate: metres =>
                (metres / 1000) / CONSTANTS.marathonKm,
            format: value => `≈ ${formatNumber(value)} marathons`,
            note: "One marathon is 42.195 km."
        },

        {
            name: "Trips around Earth",
            emoji: "🌍",
            calculate: metres =>
                (metres / 1000) / CONSTANTS.earthCircumferenceKm,
            format: value => `≈ ${formatNumber(value, 4)} trips around Earth`,
            note: "Using Earth's approximate equatorial circumference."
        },

        {
            name: "Hours walking",
            emoji: "🚶",
            calculate: metres =>
                (metres / 1000) / 5,
            format: value => `≈ ${formatNumber(value)} hours`,
            note: "Assuming an average walking speed of 5 km/h."
        }
    ],

    weight: [
        {
            name: "Bags of sugar",
            emoji: "🍬",
            calculate: kilograms =>
                kilograms / CONSTANTS.sugarBagKg,
            format: value => `≈ ${formatNumber(value)} bags`,
            note: "Using a 1 kg bag of sugar as the reference."
        },

        {
            name: "Litres of water",
            emoji: "💧",
            calculate: kilograms =>
                kilograms / CONSTANTS.waterKgPerLitre,
            format: value => `≈ ${formatNumber(value)} litres`,
            note: "Water is approximately 1 kg per litre."
        },

        {
            name: "Large dogs",
            emoji: "🐕",
            calculate: kilograms =>
                kilograms / 30,
            format: value => `≈ ${formatNumber(value)} large dogs`,
            note: "Very approximate: 30 kg per large dog."
        },

        {
            name: "Adult humans",
            emoji: "🧍",
            calculate: kilograms =>
                kilograms / 75,
            format: value => `≈ ${formatNumber(value)} adults`,
            note: "Very approximate: 75 kg per adult."
        }
    ],

    calories: [
        {
            name: "2,500 kcal days",
            emoji: "🍽️",
            calculate: calories =>
                calories / 2500,
            format: value => `≈ ${formatNumber(value)} days`,
            note: "Compared with a simplified 2,500 kcal daily reference."
        },

        {
            name: "Big Macs",
            emoji: "🍔",
            calculate: calories =>
                calories / 550,
            format: value => `≈ ${formatNumber(value)} Big Macs`,
            note: "Approximate energy comparison; product nutrition varies."
        },

        {
            name: "Chocolate bars",
            emoji: "🍫",
            calculate: calories =>
                calories / 230,
            format: value => `≈ ${formatNumber(value)} chocolate bars`,
            note: "Uses 230 kcal as a generic reference."
        },

        {
            name: "Energy equivalent of body fat",
            emoji: "⚡",
            calculate: calories =>
                calories / 7700,
            format: value => `≈ ${formatNumber(value, 2)} kg`,
            note: "Simplified energy equivalent only — not a prediction of body-fat gain or loss."
        }
    ],

    data: [
        {
            name: "Photos",
            emoji: "📷",
            calculate: bytes =>
                bytes / (CONSTANTS.photoMB * 1000000),
            format: value => `≈ ${formatNumber(value)} photos`,
            note: "Assumes an average 4 MB photo."
        },

        {
            name: "HD films",
            emoji: "🎬",
            calculate: bytes =>
                bytes / (CONSTANTS.hdFilmGB * 1000000000),
            format: value => `≈ ${formatNumber(value)} HD films`,
            note: "Assumes roughly 5 GB per HD film."
        },

        {
            name: "Songs",
            emoji: "🎵",
            calculate: bytes =>
                bytes / (CONSTANTS.songMB * 1000000),
            format: value => `≈ ${formatNumber(value)} songs`,
            note: "Assumes roughly 5 MB per compressed song."
        },

        {
            name: "Years of music",
            emoji: "🎧",
            calculate: bytes =>
                (bytes / (CONSTANTS.songMB * 1000000) * 3.5) /
                (24 * 365),
            format: value => `≈ ${formatNumber(value)} years`,
            note: "Assumes 3.5 minutes per song and continuous listening."
        }
    ],

    energy: [
        {
            name: "Phone charges",
            emoji: "📱",
            calculate: kwh =>
                kwh / CONSTANTS.phoneChargeKwh,
            format: value => `≈ ${formatNumber(value)} phone charges`,
            note: "Assumes about 15 Wh per full charge."
        },

        {
            name: "Kettle boils",
            emoji: "☕",
            calculate: kwh =>
                kwh / CONSTANTS.kettleBoilKwh,
            format: value => `≈ ${formatNumber(value)} kettle boils`,
            note: "Very approximate; actual use depends on volume and appliance efficiency."
        },

        {
            name: "Electric-car miles",
            emoji: "🚗",
            calculate: kwh =>
                kwh / CONSTANTS.electricCarKwhPerMile,
            format: value => `≈ ${formatNumber(value)} electric-car miles`,
            note: "Uses approximately 0.28 kWh per mile."
        },

        {
            name: "10 W LED hours",
            emoji: "💡",
            calculate: kwh =>
                (kwh * 1000) / CONSTANTS.ledBulbWatts,
            format: value => `≈ ${formatNumber(value)} LED-bulb hours`,
            note: "Based on a 10 W LED bulb."
        }
    ]
};

/* ============================================================
   MONEY CURRENCY
============================================================ */

const currencyRatesToGBP = {
    GBP: 1,
    USD: 0.79,
    EUR: 0.86
};

function convertCurrencyToGBP(value, currency) {
    return value * (currencyRatesToGBP[currency] || 1);
}

/* ============================================================
   CATEGORY DETECTION
============================================================ */

function getCategory(unit) {
    return unitCategories[unit] || "time";
}

function getBaseValue(value, unit, category) {
    if (category === "money") {
        return value;
    }

    const definition = conversions[category]?.[unit];

    if (!definition) {
        return value;
    }

    return value * definition.toBase;
}

function convertFromBase(baseValue, unit, category) {
    const definition = conversions[category]?.[unit];

    if (!definition || definition.toBase === 0) {
        return baseValue;
    }

    return baseValue / definition.toBase;
}

/* ============================================================
   RESULT LABELS
============================================================ */

function getResultDescription(category, unit) {
    const descriptions = {
        time: {
            minutes: "60 minutes make an hour.",
            hours: "A useful everyday measure of time.",
            days: "A full 24-hour period.",
            weeks: "Seven days make a week.",
            months: "Uses the average month length of about 30.44 days.",
            years: "Uses the average Gregorian year length.",
            decades: "Ten years.",
            centuries: "One hundred years."
        },

        distance: {
            metres: "The basic metric unit of distance.",
            kilometres: "1,000 metres.",
            miles: "One mile is exactly 1.609344 kilometres.",
            yards: "Three feet.",
            feet: "Twelve inches."
        },

        weight: {
            grams: "A basic metric unit of mass.",
            kilograms: "1,000 grams.",
            pounds: "One pound is approximately 453.6 grams.",
            ounces: "One sixteenth of a pound.",
            tonnes: "1,000 kilograms."
        },

        calories: {
            calories: "Food-energy measurement.",
            kilocalories: "The kcal unit commonly called a food calorie.",
            joules: "Energy expressed in joules.",
            kilojoules: "1,000 joules."
        },

        data: {
            bytes: "The basic digital storage unit.",
            kilobytes: "Approximately 1,000 bytes.",
            megabytes: "Approximately 1,000 kilobytes.",
            gigabytes: "Approximately 1,000 megabytes.",
            terabytes: "Approximately 1,000 gigabytes.",
            petabytes: "Approximately 1,000 terabytes."
        },

        energy: {
            joules: "The SI unit of energy.",
            kilojoules: "1,000 joules.",
            watt_hours: "Energy equivalent to one watt for one hour.",
            kilowatt_hours: "1,000 watt-hours.",
            calories: "Energy expressed as food calories."
        }
    };

    return descriptions[category]?.[unit] || "";
}

/* ============================================================
   RENDER NORMAL CONVERSION CHAIN
============================================================ */

function renderConversionChain(value, unit, category) {
    if (!resultChain) {
        return;
    }

    resultChain.innerHTML = "";

    const baseValue = getBaseValue(value, unit, category);

    let chain = categoryChains[category] || [];

    /*
        Ensure the original unit appears first.
    */
    chain = [
        unit,
        ...chain.filter(item => item !== unit)
    ];

    /*
        Remove units that become unhelpful at very large/small scales.
    */
    if (category === "time" && Math.abs(baseValue) < 60) {
        chain = ["seconds", "minutes", "hours"];
    }

    if (category === "data" && Math.abs(baseValue) < 1000000) {
        chain = ["bytes", "kilobytes", "megabytes", "gigabytes"];
    }

    if (category === "weight" && Math.abs(baseValue) < 1000) {
        chain = ["grams", "kilograms", "pounds"];
    }

    chain.forEach((targetUnit, index) => {
        const converted = convertFromBase(
            baseValue,
            targetUnit,
            category
        );

        if (!Number.isFinite(converted)) {
            return;
        }

        const definition = conversions[category][targetUnit];

        if (!definition) {
            return;
        }

        const item = document.createElement("article");

        item.className = "result-item";
        item.style.animationDelay = `${index * 70}ms`;

        item.innerHTML = `
            <div class="result-number">
                ${String(index + 1).padStart(2, "0")}
            </div>

            <div class="result-content">
                <p class="result-value">
                    ${escapeHTML(formatNumber(converted))}
                    <span>${escapeHTML(definition.label)}</span>
                </p>

                <p class="result-label">
                    ${escapeHTML(
                        index === 0
                            ? "Your starting amount"
                            : "Equivalent amount"
                    )}
                </p>

                <p class="result-note">
                    ${escapeHTML(
                        getResultDescription(category, targetUnit)
                    )}
                </p>

                <span class="result-tag">
                    ${escapeHTML(category)}
                </span>
            </div>

            <div class="result-line"></div>
        `;

        resultChain.appendChild(item);
    });
}

/* ============================================================
   RENDER FUN COMPARISONS
============================================================ */

function getComparisonBaseValue(value, unit, category) {
    switch (category) {
        case "time":
            return getBaseValue(value, unit, "time");

        case "money":
            return value;

        case "distance":
            return getBaseValue(value, unit, "distance");

        case "weight":
            return getBaseValue(value, unit, "weight") / 1000;

        case "calories":
            return getBaseValue(value, unit, "calories");

        case "data":
            return getBaseValue(value, unit, "data");

        case "energy":
            return getBaseValue(value, unit, "energy") / 3600000;

        default:
            return value;
    }
}

function renderComparisons(value, unit, category) {
    if (!chaosGrid) {
        return;
    }

    chaosGrid.innerHTML = "";

    const assumptions = getAssumptions();

    const comparisonBase = getComparisonBaseValue(
        value,
        unit,
        category
    );

    const definitions = comparisonDefinitions[category] || [];

    definitions.slice(0, 6).forEach(definition => {
        const result = definition.calculate(
            comparisonBase,
            assumptions
        );

        if (!Number.isFinite(result) || result < 0) {
            return;
        }

        const card = document.createElement("article");

        card.className = "chaos-card";

        card.innerHTML = `
            <span class="emoji" aria-hidden="true">
                ${definition.emoji}
            </span>

            <strong>
                ${escapeHTML(definition.format(result))}
            </strong>

            <span>
                ${escapeHTML(definition.note)}
            </span>
        `;

        chaosGrid.appendChild(card);
    });
}

/* ============================================================
   MONEY RESULTS
============================================================ */

function renderMoneyResults(value, currency) {
    const assumptions = getAssumptions();

    const gbp = convertCurrencyToGBP(value, currency);

    resultChain.innerHTML = "";

    const results = [
        {
            value: gbp / assumptions.wage,
            display: `${formatNumber(gbp / assumptions.wage)} hours`,
            label: "of work",
            note: `Based on £${formatNumber(assumptions.wage, 2)} per hour.`
        },

        {
            value: gbp / assumptions.coffee,
            display: `${formatNumber(gbp / assumptions.coffee)} coffees`,
            label: "at your coffee price",
            note: `Using ${formatMoney(assumptions.coffee)} per coffee.`
        },

        {
            value: gbp / assumptions.takeaway,
            display: `${formatNumber(gbp / assumptions.takeaway)} takeaway meals`,
            label: "at your meal price",
            note: `Using ${formatMoney(assumptions.takeaway)} per meal.`
        },

        {
            value: gbp / assumptions.subscription,
            display: `${formatNumber(gbp / assumptions.subscription)} months`,
            label: "of subscription",
            note: `Using ${formatMoney(assumptions.subscription)} per month.`
        },

        {
            value: gbp / assumptions.rent,
            display: `${formatNumber(gbp / assumptions.rent)} days`,
            label: "of daily rent",
            note: `Using ${formatMoney(assumptions.rent)} per day.`
        },

        {
            value: gbp / assumptions.console,
            display: `${formatNumber(gbp / assumptions.console)} consoles`,
            label: "at your console price",
            note: `Using ${formatMoney(assumptions.console)} per console.`
        }
    ];

    results.forEach((result, index) => {
        const item = document.createElement("article");

        item.className = "result-item";
        item.style.animationDelay = `${index * 70}ms`;

        item.innerHTML = `
            <div class="result-number">
                ${String(index + 1).padStart(2, "0")}
            </div>

            <div class="result-content">
                <p class="result-value">
                    ${escapeHTML(result.display)}
                </p>

                <p class="result-label">
                    ${escapeHTML(result.label)}
                </p>

                <p class="result-note">
                    ${escapeHTML(result.note)}
                </p>

                <span class="result-tag">
                    money estimate
                </span>
            </div>

            <div class="result-line"></div>
        `;

        resultChain.appendChild(item);
    });

    renderMoneyComparisons(gbp, assumptions);
}

function renderMoneyComparisons(gbp, assumptions) {
    chaosGrid.innerHTML = "";

    const comparisons = [
        {
            emoji: "☕",
            text: `${formatNumber(gbp / assumptions.coffee)} coffees`,
            note: `${formatMoney(assumptions.coffee)} each`
        },

        {
            emoji: "🍔",
            text: `${formatNumber(gbp / assumptions.bigmac)} Big Macs`,
            note: `${formatMoney(assumptions.bigmac)} each`
        },

        {
            emoji: "🎟️",
            text: `${formatNumber(gbp / assumptions.cinema)} cinema tickets`,
            note: `${formatMoney(assumptions.cinema)} each`
        },

        {
            emoji: "🍽️",
            text: `${formatNumber(gbp / assumptions.takeaway)} takeaway meals`,
            note: `${formatMoney(assumptions.takeaway)} each`
        },

        {
            emoji: "🎮",
            text: `${formatNumber(gbp / assumptions.console)} consoles`,
            note: `${formatMoney(assumptions.console)} each`
        },

        {
            emoji: "💼",
            text: `${formatNumber(gbp / assumptions.wage)} hours of work`,
            note: `at £${formatNumber(assumptions.wage, 2)}/hour`
        }
    ];

    comparisons.forEach(comparison => {
        const card = document.createElement("article");

        card.className = "chaos-card";

        card.innerHTML = `
            <span class="emoji" aria-hidden="true">
                ${comparison.emoji}
            </span>

            <strong>
                ${escapeHTML(comparison.text)}
            </strong>

            <span>
                ${escapeHTML(comparison.note)}
            </span>
        `;

        chaosGrid.appendChild(card);
    });
}

/* ============================================================
   MAIN CONVERTER
============================================================ */

function convert() {
    const raw = String(input.value)
        .replaceAll(",", "")
        .trim();

    const value = Number(raw);

    if (!Number.isFinite(value) || value <= 0) {
        showToast("Enter a number greater than zero.");
        input.focus();
        return;
    }

    const unit = unitSelect.value;

    if (!unit) {
        showToast("Choose a unit first.");
        return;
    }

    const category = getCategory(unit);

    if (category === "money") {
        renderMoneyResults(value, unit);
    } else {
        renderConversionChain(value, unit, category);
        renderComparisons(value, unit, category);
    }

    updateURL(value, unit);

    resultsSection?.classList.remove("hidden");

    scrollToResults();
}

/* ============================================================
   URL STATE
============================================================ */

function updateURL(value, unit) {
    const url = new URL(window.location.href);

    url.searchParams.set("value", value);
    url.searchParams.set("unit", unit);

    window.history.replaceState(
        {},
        "",
        `${url.pathname}?${url.searchParams.toString()}`
    );
}

function loadFromURL() {
    const params = new URLSearchParams(window.location.search);

    const urlValue = params.get("value");
    const urlUnit = params.get("unit");

    if (!urlValue || !urlUnit) {
        return false;
    }

    const numericValue = Number(urlValue);

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return false;
    }

    const optionExists = Array.from(unitSelect.options)
        .some(option => option.value === urlUnit);

    if (!optionExists) {
        return false;
    }

    input.value = numericValue;
    unitSelect.value = urlUnit;

    convert();

    return true;
}

/* ============================================================
   COPY
============================================================ */

function getPlainTextResult() {
    const value = Number(
        String(input.value).replaceAll(",", "")
    );

    const unit = unitSelect.value;
    const category = getCategory(unit);

    if (!Number.isFinite(value)) {
        return "";
    }

    if (category === "money") {
        const assumptions = getAssumptions();
        const gbp = convertCurrencyToGBP(value, unit);

        return [
            `${formatMoney(value, unit)} =`,
            `≈ ${formatNumber(gbp / assumptions.wage)} hours of work`,
            `≈ ${formatNumber(gbp / assumptions.coffee)} coffees`,
            `≈ ${formatNumber(gbp / assumptions.takeaway)} takeaway meals`,
            `≈ ${formatNumber(gbp / assumptions.subscription)} months of subscription`,
            `≈ ${formatNumber(gbp / assumptions.rent)} days of rent`
        ].join(" ");
    }

    const baseValue = getBaseValue(value, unit, category);
    const chain = categoryChains[category] || [];

    const pieces = [
        `${formatNumber(value)} ${cleanUnitName(unit)}`
    ];

    chain
        .filter(target => target !== unit)
        .slice(0, 4)
        .forEach(target => {
            const converted = convertFromBase(
                baseValue,
                target,
                category
            );

            if (Number.isFinite(converted)) {
                pieces.push(
                    `≈ ${formatNumber(converted)} ${cleanUnitName(target)}`
                );
            }
        });

    return pieces.join(" = ");
}

async function copyResult() {
    const text = getPlainTextResult();

    if (!text) {
        showToast("Nothing to copy yet.");
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        showToast("Conversion copied.");
    } catch {
        fallbackCopy(text);
    }
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
        showToast("Conversion copied.");
    } catch {
        showToast("Copy failed — select the result manually.");
    }

    textarea.remove();
}

async function copyLink() {
    const url = window.location.href;

    try {
        await navigator.clipboard.writeText(url);
        showToast("Share link copied.");
    } catch {
        fallbackCopy(url);
    }
}

async function shareConversion() {
    const url = window.location.href;
    const text = getPlainTextResult();

    if (navigator.share) {
        try {
            await navigator.share({
                title: "Everything Converter",
                text,
                url
            });

            return;
        } catch (error) {
            if (error?.name === "AbortError") {
                return;
            }
        }
    }

    await copyLink();
}

/* ============================================================
   RANDOM COMPARISON
============================================================ */

function randomComparison() {
    const value = Number(
        String(input.value).replaceAll(",", "")
    );

    const unit = unitSelect.value;

    if (!Number.isFinite(value) || value <= 0 || !unit) {
        showToast("Convert something first.");
        return;
    }

    const category = getCategory(unit);
    const assumptions = getAssumptions();

    let definitions = comparisonDefinitions[category] || [];

    if (category === "money") {
        const gbp = convertCurrencyToGBP(value, unit);

        const choices = [
            {
                emoji: "☕",
                text: `${formatNumber(gbp / assumptions.coffee)} coffees`,
                note: "At your selected coffee price."
            },
            {
                emoji: "🍔",
                text: `${formatNumber(gbp / assumptions.bigmac)} Big Macs`,
                note: "At your selected Big Mac price."
            },
            {
                emoji: "🎮",
                text: `${formatNumber(gbp / assumptions.console)} consoles`,
                note: "At your selected console price."
            },
            {
                emoji: "💼",
                text: `${formatNumber(gbp / assumptions.wage)} hours of work`,
                note: "At your selected hourly wage."
            }
        ];

        const choice =
            choices[Math.floor(Math.random() * choices.length)];

        showRandomCard(choice);
        return;
    }

    if (!definitions.length) {
        return;
    }

    const definition =
        definitions[Math.floor(Math.random() * definitions.length)];

    const comparisonBase =
        getComparisonBaseValue(value, unit, category);

    const result = definition.calculate(
        comparisonBase,
        assumptions
    );

    showRandomCard({
        emoji: definition.emoji,
        text: definition.format(result),
        note: definition.note
    });
}

function showRandomCard(data) {
    chaosGrid.innerHTML = "";

    const card = document.createElement("article");

    card.className = "chaos-card";

    card.style.animation =
        "resultIn 0.35s ease forwards";

    card.innerHTML = `
        <span class="emoji" aria-hidden="true">
            ${data.emoji}
        </span>

        <strong>
            ${escapeHTML(data.text)}
        </strong>

        <span>
            ${escapeHTML(data.note)}
        </span>
    `;

    chaosGrid.appendChild(card);

    showToast("We found a weird comparison.");
}

/* ============================================================
   SURPRISE ME
============================================================ */

const surprisePresets = [
    {
        value: 10000,
        unit: "hours"
    },

    {
        value: 73,
        unit: "GBP"
    },

    {
        value: 500,
        unit: "miles"
    },

    {
        value: 1,
        unit: "terabytes"
    },

    {
        value: 100,
        unit: "kilograms"
    },

    {
        value: 1000000,
        unit: "seconds"
    },

    {
        value: 10,
        unit: "kilowatt_hours"
    },

    {
        value: 10000,
        unit: "calories"
    }
];

function surpriseMe() {
    const preset =
        surprisePresets[
            Math.floor(Math.random() * surprisePresets.length)
        ];

    input.value = preset.value;
    unitSelect.value = preset.unit;

    convert();
}

/* ============================================================
   EXAMPLE CHIPS
============================================================ */

function setupExampleButtons() {
    const examples =
        document.querySelectorAll("[data-example]");

    examples.forEach(button => {
        button.addEventListener("click", () => {
            const value = button.dataset.value;
            const unit = button.dataset.unit;

            if (!value || !unit) {
                return;
            }

            input.value = value;
            unitSelect.value = unit;

            convert();
        });
    });
}

/* ============================================================
   EXPLORE CARDS
============================================================ */

function setupExploreCards() {
    const cards =
        document.querySelectorAll("[data-explore]");

    cards.forEach(card => {
        card.addEventListener("click", () => {
            const value = card.dataset.value;
            const unit = card.dataset.unit;

            if (!value || !unit) {
                return;
            }

            input.value = value;
            unitSelect.value = unit;

            convert();
        });
    });
}

/* ============================================================
   THEME
============================================================ */

function getSavedTheme() {
    return localStorage.getItem("everything-converter-theme");
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    localStorage.setItem(
        "everything-converter-theme",
        theme
    );

    if (themeButton) {
        themeButton.setAttribute(
            "aria-label",
            theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
        );

        themeButton.textContent =
            theme === "dark"
                ? "☀"
                : "☾";
    }
}

function setupTheme() {
    const saved = getSavedTheme();

    if (saved === "dark" || saved === "light") {
        applyTheme(saved);
        return;
    }

    const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    applyTheme(prefersDark ? "dark" : "light");
}

function toggleTheme() {
    const current =
        document.documentElement.dataset.theme;

    applyTheme(
        current === "dark"
            ? "light"
            : "dark"
    );
}

/* ============================================================
   INPUT FORMATTING
============================================================ */

function setupInput() {
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            convert();
        }
    });

    input.addEventListener("input", () => {
        input.value = input.value.replace(/[^\d.,-]/g, "");
    });
}

/* ============================================================
   ASSUMPTION EVENTS
============================================================ */

function setupAssumptions() {
    Object.values(assumptionInputs).forEach(element => {
        if (!element) {
            return;
        }

        element.addEventListener("change", () => {
            if (input.value) {
                convert();
            }
        });
    });
}

/* ============================================================
   EVENT LISTENERS
============================================================ */

convertButton?.addEventListener("click", convert);

copyTextButton?.addEventListener(
    "click",
    copyResult
);

copyLinkButton?.addEventListener(
    "click",
    copyLink
);

shareButton?.addEventListener(
    "click",
    shareConversion
);

surpriseButton?.addEventListener(
    "click",
    surpriseMe
);

themeButton?.addEventListener(
    "click",
    toggleTheme
);

/* ============================================================
   INITIALISE
============================================================ */

function init() {
    setupTheme();
    setupInput();
    setupExampleButtons();
    setupExploreCards();
    setupAssumptions();

    /*
        Try URL parameters first.
        If there isn't a URL conversion, show a useful
        default without automatically scrolling.
    */

    const loaded = loadFromURL();

    if (!loaded) {
        input.value = "10000";

        if (unitSelect) {
            unitSelect.value = "hours";
        }

        /*
            Render the initial result without scrolling.
        */
        const category = getCategory("hours");

        renderConversionChain(
            10000,
            "hours",
            category
        );

        renderComparisons(
            10000,
            "hours",
            category
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    init
);