(() => {
    "use strict";

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => [...document.querySelectorAll(selector)];

    const mainInput = $("#mainInput");
    const unitSelect = $("#unitSelect");
    const converterForm = $("#converterForm");
    const resultsSection = $("#results");
    const resultsTitle = $("#resultsTitle");
    const conversionJourney = $("#conversionJourney");
    const comparisonGrid = $("#comparisonGrid");
    const inputSymbol = $("#inputSymbol");
    const toast = $("#toast");

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

    const units = {
        // TIME
        seconds: {
            category: "time",
            label: "Seconds",
            symbol: "s",
            factor: 1
        },
        minutes: {
            category: "time",
            label: "Minutes",
            symbol: "min",
            factor: 60
        },
        hours: {
            category: "time",
            label: "Hours",
            symbol: "h",
            factor: 3600
        },
        days: {
            category: "time",
            label: "Days",
            symbol: "days",
            factor: 86400
        },
        weeks: {
            category: "time",
            label: "Weeks",
            symbol: "weeks",
            factor: 604800
        },
        months: {
            category: "time",
            label: "Months",
            symbol: "months",
            factor: 2629800
        },
        years: {
            category: "time",
            label: "Years",
            symbol: "years",
            factor: 31557600
        },
        decades: {
            category: "time",
            label: "Decades",
            symbol: "decades",
            factor: 315576000
        },
        centuries: {
            category: "time",
            label: "Centuries",
            symbol: "centuries",
            factor: 3155760000
        },

        // DISTANCE
        metres: {
            category: "distance",
            label: "Metres",
            symbol: "m",
            factor: 1
        },
        km: {
            category: "distance",
            label: "Kilometres",
            symbol: "km",
            factor: 1000
        },
        miles: {
            category: "distance",
            label: "Miles",
            symbol: "mi",
            factor: 1609.344
        },
        feet: {
            category: "distance",
            label: "Feet",
            symbol: "ft",
            factor: 0.3048
        },
        yards: {
            category: "distance",
            label: "Yards",
            symbol: "yd",
            factor: 0.9144
        },
        inches: {
            category: "distance",
            label: "Inches",
            symbol: "in",
            factor: 0.0254
        },

        // WEIGHT
        grams: {
            category: "weight",
            label: "Grams",
            symbol: "g",
            factor: 1
        },
        kg: {
            category: "weight",
            label: "Kilograms",
            symbol: "kg",
            factor: 1000
        },
        lb: {
            category: "weight",
            label: "Pounds",
            symbol: "lb",
            factor: 453.59237
        },
        oz: {
            category: "weight",
            label: "Ounces",
            symbol: "oz",
            factor: 28.349523125
        },
        tonnes: {
            category: "weight",
            label: "Tonnes",
            symbol: "t",
            factor: 1000000
        },

        // DATA
        bytes: {
            category: "data",
            label: "Bytes",
            symbol: "B",
            factor: 1
        },
        kb: {
            category: "data",
            label: "Kilobytes",
            symbol: "KB",
            factor: 1000
        },
        mb: {
            category: "data",
            label: "Megabytes",
            symbol: "MB",
            factor: 1000000
        },
        gb: {
            category: "data",
            label: "Gigabytes",
            symbol: "GB",
            factor: 1000000000
        },
        tb: {
            category: "data",
            label: "Terabytes",
            symbol: "TB",
            factor: 1000000000000
        },
        pb: {
            category: "data",
            label: "Petabytes",
            symbol: "PB",
            factor: 1000000000000000
        },

        // CALORIES
        calories: {
            category: "calories",
            label: "Calories",
            symbol: "kcal",
            factor: 1
        },

        // ENERGY
        joules: {
            category: "energy",
            label: "Joules",
            symbol: "J",
            factor: 1
        },
        kj: {
            category: "energy",
            label: "Kilojoules",
            symbol: "kJ",
            factor: 1000
        },
        kwh: {
            category: "energy",
            label: "Kilowatt-hours",
            symbol: "kWh",
            factor: 3600000
        },

        // MONEY
        gbp: {
            category: "money",
            label: "British Pounds",
            symbol: "£",
            factor: 1
        },
        usd: {
            category: "money",
            label: "US Dollars",
            symbol: "$",
            factor: 0.74
        },
        eur: {
            category: "money",
            label: "Euros",
            symbol: "€",
            factor: 0.86
        }
    };

    const unitGroups = {
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
        distance: [
            "metres",
            "km",
            "miles",
            "feet",
            "yards",
            "inches"
        ],
        weight: [
            "grams",
            "kg",
            "lb",
            "oz",
            "tonnes"
        ],
        data: [
            "bytes",
            "kb",
            "mb",
            "gb",
            "tb",
            "pb"
        ],
        calories: [
            "calories"
        ],
        energy: [
            "joules",
            "kj",
            "kwh"
        ],
        money: [
            "gbp",
            "usd",
            "eur"
        ]
    };

    function formatNumber(value, decimals = 2) {
        if (!Number.isFinite(value)) {
            return "0";
        }

        const absolute = Math.abs(value);

        if (absolute === 0) {
            return "0";
        }

        if (absolute >= 1000000000000) {
            return value.toExponential(2);
        }

        if (absolute >= 1000000000) {
            return `${(value / 1000000000).toFixed(2).replace(/\.?0+$/, "")} billion`;
        }

        if (absolute >= 1000000) {
            return `${(value / 1000000).toFixed(2).replace(/\.?0+$/, "")} million`;
        }

        if (absolute >= 1000) {
            return value.toLocaleString("en-GB", {
                maximumFractionDigits: decimals
            });
        }

        if (absolute < 0.01) {
            return value.toExponential(2);
        }

        return value.toLocaleString("en-GB", {
            maximumFractionDigits: decimals
        });
    }

    function formatMoney(value, symbol = "£") {
        if (!Number.isFinite(value)) {
            return `${symbol}0`;
        }

        return `${symbol}${value.toLocaleString("en-GB", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })}`;
    }

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getUnitOptions() {
        const categoryOrder = [
            ["time", "Time"],
            ["distance", "Distance"],
            ["weight", "Weight"],
            ["data", "Data"],
            ["calories", "Calories"],
            ["energy", "Energy"],
            ["money", "Money"]
        ];

        return categoryOrder
            .map(([category, label]) => {
                const options = unitGroups[category]
                    .map((key) => {
                        const unit = units[key];

                        return `
                            <option value="${key}">
                                ${unit.label}
                            </option>
                        `;
                    })
                    .join("");

                return `
                    <optgroup label="${label}">
                        ${options}
                    </optgroup>
                `;
            })
            .join("");
    }

    function populateUnits() {
        if (!unitSelect) return;

        unitSelect.innerHTML = getUnitOptions();
        unitSelect.value = "hours";

        updateInputSymbol();
    }

    function updateInputSymbol() {
        const unit = units[unitSelect.value];

        if (inputSymbol && unit) {
            inputSymbol.textContent = unit.symbol;
        }
    }

    function convertToBase(value, unitKey) {
        const unit = units[unitKey];

        if (!unit) {
            return value;
        }

        return value * unit.factor;
    }

    function convertFromBase(value, unitKey) {
        const unit = units[unitKey];

        if (!unit || unit.factor === 0) {
            return value;
        }

        return value / unit.factor;
    }

    function renderJourney(value, unitKey) {
        const unit = units[unitKey];

        if (!unit) {
            return;
        }

        const baseValue = convertToBase(value, unitKey);

        let journey = [];

        if (unit.category === "time") {
            journey = [
                {
                    label: "Seconds",
                    value: baseValue,
                    description: "Every moment added together."
                },
                {
                    label: "Minutes",
                    value: baseValue / 60,
                    description: "60 seconds make a minute."
                },
                {
                    label: "Hours",
                    value: baseValue / 3600,
                    description: "A more human-sized chunk of time."
                },
                {
                    label: "Days",
                    value: baseValue / 86400,
                    description: "24 hours in each day."
                },
                {
                    label: "Weeks",
                    value: baseValue / 604800,
                    description: "Seven days at a time."
                },
                {
                    label: "Years",
                    value: baseValue / 31557600,
                    description: "Using the average Gregorian year."
                }
            ];
        }

        if (unit.category === "distance") {
            journey = [
                {
                    label: "Millimetres",
                    value: baseValue * 1000,
                    description: "Tiny individual units."
                },
                {
                    label: "Metres",
                    value: baseValue,
                    description: "The standard metric distance."
                },
                {
                    label: "Kilometres",
                    value: baseValue / 1000,
                    description: "1,000 metres make a kilometre."
                },
                {
                    label: "Miles",
                    value: baseValue / 1609.344,
                    description: "One mile is 1,609.344 metres."
                }
            ];
        }

        if (unit.category === "weight") {
            journey = [
                {
                    label: "Grams",
                    value: baseValue,
                    description: "The basic metric unit."
                },
                {
                    label: "Kilograms",
                    value: baseValue / 1000,
                    description: "1,000 grams make a kilogram."
                },
                {
                    label: "Pounds",
                    value: baseValue / 453.59237,
                    description: "One pound is 453.59237 grams."
                },
                {
                    label: "Tonnes",
                    value: baseValue / 1000000,
                    description: "One tonne is 1,000 kilograms."
                }
            ];
        }

        if (unit.category === "data") {
            journey = [
                {
                    label: "Bytes",
                    value: baseValue,
                    description: "The smallest unit here."
                },
                {
                    label: "Kilobytes",
                    value: baseValue / 1000,
                    description: "Using decimal storage units."
                },
                {
                    label: "Megabytes",
                    value: baseValue / 1000000,
                    description: "1 million bytes."
                },
                {
                    label: "Gigabytes",
                    value: baseValue / 1000000000,
                    description: "1 billion bytes."
                },
                {
                    label: "Terabytes",
                    value: baseValue / 1000000000000,
                    description: "1 trillion bytes."
                }
            ];
        }

        if (unit.category === "calories") {
            journey = [
                {
                    label: "Calories",
                    value: baseValue,
                    description: "Food energy measured directly."
                },
                {
                    label: "Daily food budgets",
                    value: baseValue / 2500,
                    description: "Using 2,500 kcal as a rough daily reference."
                },
                {
                    label: "Big Macs",
                    value: baseValue / 493,
                    description: "Roughly 493 kcal each."
                }
            ];
        }

        if (unit.category === "energy") {
            journey = [
                {
                    label: "Joules",
                    value: baseValue,
                    description: "The standard SI unit of energy."
                },
                {
                    label: "Kilojoules",
                    value: baseValue / 1000,
                    description: "1,000 joules make a kilojoule."
                },
                {
                    label: "Kilowatt-hours",
                    value: baseValue / 3600000,
                    description: "A common household energy measure."
                }
            ];
        }

        if (unit.category === "money") {
            const gbp = baseValue;

            journey = [
                {
                    label: "Pounds",
                    value: gbp,
                    description: "British pounds."
                },
                {
                    label: "Coffees",
                    value: gbp / assumptions.coffee,
                    description: `Using ${formatMoney(assumptions.coffee)} per coffee.`
                },
                {
                    label: "Takeaways",
                    value: gbp / assumptions.meal,
                    description: `Using ${formatMoney(assumptions.meal)} per takeaway.`
                },
                {
                    label: "Hours of work",
                    value: gbp / assumptions.wage,
                    description: `Using £${assumptions.wage.toFixed(2)} per hour.`
                }
            ];
        }

        conversionJourney.innerHTML = "";

        journey.forEach((step, index) => {
            const element = document.createElement("div");
            element.className = "conversion-step";

            element.innerHTML = `
                <div class="step-label">
                    ${escapeHTML(step.label)}
                </div>

                <div class="step-value">
                    ${formatNumber(step.value)}
                </div>

                <div class="step-description">
                    ${escapeHTML(step.description)}
                </div>
            `;

            element.style.animationDelay = `${index * 60}ms`;

            conversionJourney.appendChild(element);
        });
    }

    function createComparisons(value, unitKey) {
        const unit = units[unitKey];

        if (!unit) {
            return [];
        }

        const baseValue = convertToBase(value, unitKey);

        if (unit.category === "time") {
            const seconds = baseValue;

            return [
                {
                    icon: "🎵",
                    label: "Songs",
                    value: seconds / 210,
                    note: "At roughly 3½ minutes per song."
                },
                {
                    icon: "🎬",
                    label: "Films",
                    value: seconds / 7200,
                    note: "Using a 2-hour film."
                },
                {
                    icon: "⚽",
                    label: "Football matches",
                    value: seconds / 5400,
                    note: "90 minutes, ignoring added time."
                },
                {
                    icon: "💼",
                    label: "Working hours",
                    value: seconds / 3600,
                    note: "Raw hours, before breaks."
                },
                {
                    icon: "😴",
                    label: "Hours of sleep",
                    value: seconds / 28800,
                    note: "Using 8 hours per night."
                },
                {
                    icon: "📅",
                    label: "Weekends",
                    value: seconds / 172800,
                    note: "Two days per weekend."
                }
            ];
        }

        if (unit.category === "money") {
            const gbp = baseValue;

            return [
                {
                    icon: "☕",
                    label: "Coffees",
                    value: gbp / assumptions.coffee,
                    note: `At ${formatMoney(assumptions.coffee)} each.`
                },
                {
                    icon: "🍔",
                    label: "Big Macs",
                    value: gbp / assumptions.burger,
                    note: `Using ${formatMoney(assumptions.burger)} each.`
                },
                {
                    icon: "🥡",
                    label: "Takeaways",
                    value: gbp / assumptions.meal,
                    note: `At ${formatMoney(assumptions.meal)} each.`
                },
                {
                    icon: "💼",
                    label: "Hours of work",
                    value: gbp / assumptions.wage,
                    note: `At £${assumptions.wage.toFixed(2)} per hour.`
                },
                {
                    icon: "🏠",
                    label: "Days of rent",
                    value: gbp / assumptions.rent,
                    note: `Using ${formatMoney(assumptions.rent)} per day.`
                },
                {
                    icon: "🎮",
                    label: "Game consoles",
                    value: gbp / assumptions.console,
                    note: `Using ${formatMoney(assumptions.console)} per console.`
                }
            ];
        }

        if (unit.category === "distance") {
            const metres = baseValue;

            return [
                {
                    icon: "👣",
                    label: "Steps",
                    value: metres / assumptions.step,
                    note: `Using an average ${assumptions.step} m step.`
                },
                {
                    icon: "⚽",
                    label: "Football pitches",
                    value: metres / 105,
                    note: "Using a 105 m pitch length."
                },
                {
                    icon: "🏃",
                    label: "Marathons",
                    value: metres / 42195,
                    note: "A marathon is 42.195 km."
                },
                {
                    icon: "🌍",
                    label: "Trips around Earth",
                    value: metres / 40075000,
                    note: "Using roughly 40,075 km around Earth's equator."
                },
                {
                    icon: "🚶",
                    label: "Hours walking",
                    value: metres / 5000,
                    note: "Assuming roughly 5 km/h walking speed."
                },
                {
                    icon: "🚌",
                    label: "London bus lengths",
                    value: metres / 11,
                    note: "Using roughly 11 m per bus."
                }
            ];
        }

        if (unit.category === "weight") {
            const grams = baseValue;

            return [
                {
                    icon: "🧍",
                    label: "Adults",
                    value: grams / 80000,
                    note: "Using an 80 kg reference."
                },
                {
                    icon: "🛍️",
                    label: "1 kg sugar bags",
                    value: grams / 1000,
                    note: "Each bag represents 1 kg."
                },
                {
                    icon: "💧",
                    label: "Litres of water",
                    value: grams / 1000,
                    note: "1 litre of water weighs roughly 1 kg."
                },
                {
                    icon: "🐕",
                    label: "Large dogs",
                    value: grams / 30000,
                    note: "Using a 30 kg reference."
                },
                {
                    icon: "🧱",
                    label: "Bricks",
                    value: grams / 2500,
                    note: "Using roughly 2.5 kg per brick."
                }
            ];
        }

        if (unit.category === "data") {
            const bytes = baseValue;

            return [
                {
                    icon: "📷",
                    label: "Photos",
                    value: bytes / 5000000,
                    note: "Using roughly 5 MB per photo."
                },
                {
                    icon: "🎬",
                    label: "HD films",
                    value: bytes / 5000000000,
                    note: "Using roughly 5 GB per film."
                },
                {
                    icon: "🎵",
                    label: "Songs",
                    value: bytes / 10000000,
                    note: "Using roughly 10 MB per song."
                },
                {
                    icon: "🎧",
                    label: "Years of music",
                    value: bytes / 315360000000,
                    note: "Roughly 10 MB per 3½-minute song."
                },
                {
                    icon: "💾",
                    label: "1 TB drives",
                    value: bytes / 1000000000000,
                    note: "Using decimal terabytes."
                }
            ];
        }

        if (unit.category === "calories") {
            const calories = baseValue;

            return [
                {
                    icon: "🍽️",
                    label: "2,500-calorie days",
                    value: calories / 2500,
                    note: "Using 2,500 kcal as a rough daily reference."
                },
                {
                    icon: "🍔",
                    label: "Big Macs",
                    value: calories / 493,
                    note: "Roughly 493 kcal each."
                },
                {
                    icon: "🍫",
                    label: "Chocolate bars",
                    value: calories / 230,
                    note: "Using roughly 230 kcal per bar."
                },
                {
                    icon: "🍕",
                    label: "Pizzas",
                    value: calories / 1000,
                    note: "Using roughly 1,000 kcal per pizza."
                }
            ];
        }

        if (unit.category === "energy") {
            const joules = baseValue;

            return [
                {
                    icon: "📱",
                    label: "Phone charges",
                    value: joules / 72000,
                    note: "Using roughly 20 Wh per full charge."
                },
                {
                    icon: "🫖",
                    label: "Kettle boils",
                    value: joules / 180000,
                    note: "Using roughly 0.05 kWh per boil."
                },
                {
                    icon: "🚿",
                    label: "Showers",
                    value: joules / 5000000,
                    note: "A rough energy comparison."
                },
                {
                    icon: "💡",
                    label: "LED bulb hours",
                    value: joules / 360000,
                    note: "Using a 100 W equivalent energy reference."
                },
                {
                    icon: "🚗",
                    label: "Electric car miles",
                    value: joules / 900000,
                    note: "Using a rough 0.25 kWh per mile."
                }
            ];
        }

        return [];
    }

    function renderComparisons(comparisons) {
        comparisonGrid.innerHTML = "";

        comparisons.forEach((comparison) => {
            const card = document.createElement("article");
            card.className = "comparison-card";

            card.innerHTML = `
                <div class="comparison-icon">
                    ${comparison.icon}
                </div>

                <div class="comparison-label">
                    ${escapeHTML(comparison.label)}
                </div>

                <div class="comparison-value">
                    ${formatNumber(comparison.value)}
                </div>

                <div class="comparison-note">
                    ${escapeHTML(comparison.note)}
                </div>
            `;

            comparisonGrid.appendChild(card);
        });
    }

    function generateWeirdComparison(value, unitKey) {
        const unit = units[unitKey];

        if (!unit) {
            return {
                title: "That's a lot.",
                description: "Try another number."
            };
        }

        const baseValue = convertToBase(value, unitKey);

        if (unit.category === "time") {
            const days = baseValue / 86400;

            if (days >= 365) {
                return {
                    title: "You've been alive for a while.",
                    description: `That's roughly ${formatNumber(days / 365)} years of time.`
                };
            }

            if (days >= 30) {
                return {
                    title: "That's basically a whole era.",
                    description: `You're looking at around ${formatNumber(days / 30)} months.`
                };
            }

            return {
                title: "That's a suspicious amount of time.",
                description: `Enough time for roughly ${formatNumber(baseValue / 210)} songs.`
            };
        }

        if (unit.category === "money") {
            const gbp = baseValue;

            if (gbp >= 1000000) {
                return {
                    title: "That's proper money.",
                    description: `You could buy roughly ${formatNumber(gbp / assumptions.console)} game consoles.`
                };
            }

            if (gbp >= 100000) {
                return {
                    title: "That's a lot of weekends.",
                    description: `At £${assumptions.rent} per day, that's around ${formatNumber(gbp / assumptions.rent)} days of rent.`
                };
            }

            return {
                title: "That's a dangerous amount of takeaway money.",
                description: `At ${formatMoney(assumptions.meal)} each, that's around ${formatNumber(gbp / assumptions.meal)} takeaways.`
            };
        }

        if (unit.category === "distance") {
            const miles = baseValue / 1609.344;

            return {
                title: "You could've gone somewhere.",
                description: `That's roughly ${formatNumber(miles)} miles — about ${formatNumber(miles / 26.2188)} marathons.`
            };
        }

        if (unit.category === "weight") {
            const kg = baseValue / 1000;

            return {
                title: "That's getting heavy.",
                description: `That's about ${formatNumber(kg / 2.5)} standard bricks.`
            };
        }

        if (unit.category === "data") {
            const gb = baseValue / 1000000000;

            return {
                title: "That's a lot of storage.",
                description: `That's roughly ${formatNumber(gb / 5)} HD films at around 5 GB each.`
            };
        }

        if (unit.category === "calories") {
            return {
                title: "That's a serious amount of food energy.",
                description: `That's roughly ${formatNumber(baseValue / 2500)} days worth of 2,500-calorie food budgets.`
            };
        }

        if (unit.category === "energy") {
            return {
                title: "That's some serious energy.",
                description: `That's roughly ${formatNumber(baseValue / 72000)} full smartphone charges.`
            };
        }

        return {
            title: "That's a lot.",
            description: "Now you have a better idea of what it means."
        };
    }

    function renderWeirdComparison(value, unitKey) {
        const weird = generateWeirdComparison(value, unitKey);

        $("#weirdTitle").textContent = weird.title;
        $("#weirdDescription").textContent = weird.description;
    }

    function convert() {
        const value = Number(mainInput.value);
        const unitKey = unitSelect.value;
        const unit = units[unitKey];

        if (!Number.isFinite(value) || value < 0 || !unit) {
            showToast("Enter a valid number.");
            mainInput.focus();
            return;
        }

        resultsTitle.textContent =
            `${formatNumber(value)} ${unit.label.toLowerCase()}`;

        renderJourney(value, unitKey);

        const comparisons = createComparisons(value, unitKey);

        renderComparisons(comparisons);
        renderWeirdComparison(value, unitKey);

        resultsSection.hidden = false;

        resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        updateURL(value, unitKey);
    }

    function updateURL(value, unitKey) {
        try {
            const url = new URL(window.location.href);

            url.searchParams.set("value", value);
            url.searchParams.set("unit", unitKey);

            window.history.replaceState({}, "", url);
        } catch (error) {
            // Ignore URL errors.
        }
    }

    function loadFromURL() {
        try {
            const params = new URLSearchParams(window.location.search);

            const value = params.get("value");
            const unit = params.get("unit");

            if (value !== null && units[unit]) {
                mainInput.value = value;
                unitSelect.value = unit;
                updateInputSymbol();

                convert();
            }
        } catch (error) {
            // Ignore URL loading errors.
        }
    }

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.hidden = false;

        clearTimeout(showToast.timeout);

        showToast.timeout = setTimeout(() => {
            toast.hidden = true;
        }, 2400);
    }

    async function copyResult() {
        const title = resultsTitle.textContent;
        const weirdTitle = $("#weirdTitle")?.textContent || "";
        const weirdDescription = $("#weirdDescription")?.textContent || "";

        const text = [
            "Everything Converter",
            "",
            title,
            "",
            weirdTitle,
            weirdDescription
        ].join("\n");

        try {
            await navigator.clipboard.writeText(text);
            showToast("Result copied.");
        } catch (error) {
            showToast("Couldn't copy automatically.");
        }
    }

    async function shareResult() {
        const title = resultsTitle.textContent;
        const weirdTitle = $("#weirdTitle")?.textContent || "";
        const weirdDescription = $("#weirdDescription")?.textContent || "";

        const shareData = {
            title: "Everything Converter",
            text: `${title}\n\n${weirdTitle}\n${weirdDescription}`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                // User cancelled sharing.
            }
        } else {
            await copyResult();
        }
    }

    function applyAssumptions() {
        const fields = {
            wage: $("#assumeWage"),
            coffee: $("#assumeCoffee"),
            meal: $("#assumeMeal"),
            subscription: $("#assumeSubscription"),
            rent: $("#assumeRent"),
            console: $("#assumeConsole"),
            burger: $("#assumeBurger"),
            step: $("#assumeStep")
        };

        Object.entries(fields).forEach(([key, input]) => {
            if (!input) return;

            const value = Number(input.value);

            if (Number.isFinite(value) && value > 0) {
                assumptions[key] = value;
            }
        });

        showToast("Assumptions updated.");

        if (!resultsSection.hidden) {
            convert();
        }
    }

    function setupExamples() {
        $$(".example-chip").forEach((chip) => {
            chip.addEventListener("click", () => {
                const value = chip.dataset.value;
                const unit = chip.dataset.unit;

                if (value) {
                    mainInput.value = value;
                }

                if (unit && units[unit]) {
                    unitSelect.value = unit;
                    updateInputSymbol();
                }

                convert();
            });
        });
    }

    function setupExplore() {
        $$(".explore-card").forEach((card) => {
            card.addEventListener("click", () => {
                const value = card.dataset.value;
                const unit = card.dataset.unit;

                if (value) {
                    mainInput.value = value;
                }

                if (unit && units[unit]) {
                    unitSelect.value = unit;
                    updateInputSymbol();
                }

                convert();
            });
        });
    }

    function setupSurpriseMe() {
        const surpriseButton = $("#surpriseButton");

        if (!surpriseButton) return;

        const surprises = [
            { value: 1000000, unit: "seconds" },
            { value: 100000, unit: "gbp" },
            { value: 1000, unit: "miles" },
            { value: 10, unit: "tb" },
            { value: 10000, unit: "hours" },
            { value: 1000000000, unit: "seconds" },
            { value: 100, unit: "kg" },
            { value: 500000, unit: "calories" }
        ];

        surpriseButton.addEventListener("click", () => {
            const random =
                surprises[Math.floor(Math.random() * surprises.length)];

            mainInput.value = random.value;
            unitSelect.value = random.unit;

            updateInputSymbol();
            convert();
        });
    }

    function setupTheme() {
        const themeButton = $("#themeButton");
        const themeIcon = $("#themeIcon");

        if (!themeButton) return;

        const savedTheme = localStorage.getItem("everything-converter-theme");

        if (savedTheme === "dark") {
            document.documentElement.dataset.theme = "dark";

            if (themeIcon) {
                themeIcon.textContent = "☀";
            }
        }

        themeButton.addEventListener("click", () => {
            const isDark =
                document.documentElement.dataset.theme === "dark";

            if (isDark) {
                delete document.documentElement.dataset.theme;
                localStorage.setItem(
                    "everything-converter-theme",
                    "light"
                );

                if (themeIcon) {
                    themeIcon.textContent = "☾";
                }
            } else {
                document.documentElement.dataset.theme = "dark";
                localStorage.setItem(
                    "everything-converter-theme",
                    "dark"
                );

                if (themeIcon) {
                    themeIcon.textContent = "☀";
                }
            }
        });
    }

    function setupNavigation() {
        $$(".nav-links a").forEach((link) => {
            link.addEventListener("click", () => {
                const target = link.getAttribute("href");

                if (!target || !target.startsWith("#")) {
                    return;
                }

                const element = $(target);

                if (element) {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            });
        });

        const brand = $(".brand");

        if (brand) {
            brand.addEventListener("click", (event) => {
                event.preventDefault();

                window.location.href = "./";
            });
        }
    }

    function setupAssumptions() {
        const collapseButton = $(".collapse-button");
        const assumptionPanel = $(".side-panel");

        if (!collapseButton || !assumptionPanel) {
            return;
        }

        collapseButton.addEventListener("click", () => {
            const collapsed =
                assumptionPanel.classList.toggle("collapsed");

            collapseButton.setAttribute(
                "aria-expanded",
                String(!collapsed)
            );
        });

        const applyButton = $(".apply-button");

        if (applyButton) {
            applyButton.addEventListener("click", applyAssumptions);
        }
    }

    function setupButtons() {
        const copyButton = $("#copyResult");
        const shareButton = $("#shareResult");
        const anotherWeird = $("#anotherWeird");

        if (copyButton) {
            copyButton.addEventListener("click", copyResult);
        }

        if (shareButton) {
            shareButton.addEventListener("click", shareResult);
        }

        if (anotherWeird) {
            anotherWeird.addEventListener("click", () => {
                const value = Number(mainInput.value);
                const unit = unitSelect.value;

                if (Number.isFinite(value) && units[unit]) {
                    renderWeirdComparison(value, unit);
                }
            });
        }
    }

    function setupKeyboard() {
        if (!mainInput) return;

        mainInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                convert();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                if (resultsSection) {
                    resultsSection.hidden = true;
                }
            }
        });
    }

    function setupForm() {
        if (!converterForm) return;

        converterForm.addEventListener("submit", (event) => {
            event.preventDefault();
            convert();
        });

        unitSelect.addEventListener("change", updateInputSymbol);
    }

    function init() {
        populateUnits();
        setupForm();
        setupExamples();
        setupExplore();
        setupSurpriseMe();
        setupTheme();
        setupNavigation();
        setupAssumptions();
        setupButtons();
        setupKeyboard();
        loadFromURL();
    }

    init();
})();