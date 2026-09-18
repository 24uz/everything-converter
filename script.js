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
        seconds: { category: "time", label: "Seconds", symbol: "s", factor: 1 },
        minutes: { category: "time", label: "Minutes", symbol: "min", factor: 60 },
        hours: { category: "time", label: "Hours", symbol: "h", factor: 3600 },
        days: { category: "time", label: "Days", symbol: "days", factor: 86400 },
        weeks: { category: "time", label: "Weeks", symbol: "weeks", factor: 604800 },
        months: { category: "time", label: "Months", symbol: "months", factor: 2629800 },
        years: { category: "time", label: "Years", symbol: "years", factor: 31557600 },
        decades: { category: "time", label: "Decades", symbol: "decades", factor: 315576000 },
        centuries: { category: "time", label: "Centuries", symbol: "centuries", factor: 3155760000 },

        metres: { category: "distance", label: "Metres", symbol: "m", factor: 1 },
        km: { category: "distance", label: "Kilometres", symbol: "km", factor: 1000 },
        miles: { category: "distance", label: "Miles", symbol: "mi", factor: 1609.344 },
        feet: { category: "distance", label: "Feet", symbol: "ft", factor: 0.3048 },
        yards: { category: "distance", label: "Yards", symbol: "yd", factor: 0.9144 },
        inches: { category: "distance", label: "Inches", symbol: "in", factor: 0.0254 },

        grams: { category: "weight", label: "Grams", symbol: "g", factor: 1 },
        kg: { category: "weight", label: "Kilograms", symbol: "kg", factor: 1000 },
        lb: { category: "weight", label: "Pounds", symbol: "lb", factor: 453.59237 },
        oz: { category: "weight", label: "Ounces", symbol: "oz", factor: 28.349523125 },
        tonnes: { category: "weight", label: "Tonnes", symbol: "t", factor: 1000000 },

        bytes: { category: "data", label: "Bytes", symbol: "B", factor: 1 },
        kb: { category: "data", label: "Kilobytes", symbol: "KB", factor: 1000 },
        mb: { category: "data", label: "Megabytes", symbol: "MB", factor: 1000000 },
        gb: { category: "data", label: "Gigabytes", symbol: "GB", factor: 1000000000 },
        tb: { category: "data", label: "Terabytes", symbol: "TB", factor: 1000000000000 },
        pb: { category: "data", label: "Petabytes", symbol: "PB", factor: 1000000000000000 },

        calories: { category: "calories", label: "Calories", symbol: "kcal", factor: 1 },

        joules: { category: "energy", label: "Joules", symbol: "J", factor: 1 },
        kj: { category: "energy", label: "Kilojoules", symbol: "kJ", factor: 1000 },
        kwh: { category: "energy", label: "Kilowatt-hours", symbol: "kWh", factor: 3600000 },

        gbp: { category: "money", label: "British Pounds", symbol: "£", factor: 1 },
        usd: { category: "money", label: "US Dollars", symbol: "$", factor: 0.74 },
        eur: { category: "money", label: "Euros", symbol: "€", factor: 0.86 }
    };

    function formatNumber(number, decimals = 2) {
        if (!Number.isFinite(number)) return "—";

        const abs = Math.abs(number);

        if (abs >= 1000000) {
            return number.toLocaleString("en-GB", {
                maximumFractionDigits: 2
            });
        }

        if (abs >= 1000) {
            return number.toLocaleString("en-GB", {
                maximumFractionDigits: decimals
            });
        }

        if (abs >= 100) {
            decimals = Math.min(decimals, 1);
        }

        return number.toLocaleString("en-GB", {
            maximumFractionDigits: decimals
        });
    }

    function plural(value, singular, pluralForm = `${singular}s`) {
        return Math.abs(value - 1) < 0.0001 ? singular : pluralForm;
    }

    function populateUnits(selectedUnit = "hours") {
        if (!unitSelect) return;

        unitSelect.innerHTML = "";

        const groups = {};

        Object.keys(units).forEach((key) => {
            const category = units[key].category;

            if (!groups[category]) {
                groups[category] = [];
            }

            groups[category].push(key);
        });

        const categoryNames = {
            time: "Time",
            money: "Money",
            distance: "Distance",
            weight: "Weight",
            calories: "Calories",
            data: "Data",
            energy: "Energy"
        };

        Object.entries(groups).forEach(([category, keys]) => {
            const group = document.createElement("optgroup");
            group.label = categoryNames[category] || category;

            keys.forEach((key) => {
                const option = document.createElement("option");

                option.value = key;
                option.textContent =
                    `${units[key].label} (${units[key].symbol})`;

                group.appendChild(option);
            });

            unitSelect.appendChild(group);
        });

        if (units[selectedUnit]) {
            unitSelect.value = selectedUnit;
        }

        updateInputSymbol();
    }

    function updateInputSymbol() {
        if (!inputSymbol || !unitSelect) return;

        const unit = units[unitSelect.value];

        if (!unit) {
            inputSymbol.textContent = "";
            return;
        }

        inputSymbol.textContent =
            unit.category === "money" ? unit.symbol : "";
    }

    function toBase(value, unitKey) {
        const unit = units[unitKey];
        return unit ? value * unit.factor : value;
    }

    function timeDescription(seconds) {
        const minutes = seconds / 60;
        const hours = seconds / 3600;
        const days = seconds / 86400;
        const years = seconds / 31557600;

        if (hours < 1) {
            return `About ${formatNumber(minutes, 1)} ${plural(minutes, "minute")}.`;
        }

        if (days < 1) {
            return `About ${formatNumber(hours, 1)} ${plural(hours, "hour")}.`;
        }

        if (years < 1) {
            return `About ${formatNumber(days, 1)} ${plural(days, "day")}.`;
        }

        return `About ${formatNumber(years, 2)} ${plural(years, "year")}.`;
    }

    function buildJourney(value, unitKey) {
        const unit = units[unitKey];

        if (!unit) return [];

        const category = unit.category;

        const steps = [
            {
                label: "Starting point",
                value,
                unit: unit.label,
                description: "That's the amount you entered."
            }
        ];

        if (category === "time") {
            const base = toBase(value, unitKey);

            const candidates = [
                ["minutes", base / 60],
                ["hours", base / 3600],
                ["days", base / 86400],
                ["weeks", base / 604800],
                ["months", base / 2629800],
                ["years", base / 31557600]
            ];

            candidates.forEach(([key, amount]) => {
                if (
                    amount >= 0.01 &&
                    key !== unitKey &&
                    steps.length < 5
                ) {
                    steps.push({
                        label: "Same amount",
                        value: amount,
                        unit: units[key].label,
                        description: timeDescription(base)
                    });
                }
            });

            const workingHours = base / 3600;
            const workingDays = workingHours / 8;

            if (workingDays >= 1) {
                steps.push({
                    label: "Working time",
                    value: workingDays,
                    unit: "working days",
                    description: "Using an 8-hour working day."
                });
            }

            const workingLife =
                50 * 365.2425 * 24 * 3600;

            steps.push({
                label: "Perspective",
                value: (base / workingLife) * 100,
                unit: "% of a 50-year working life",
                description: "A deliberately simplified perspective."
            });
        }

        if (category === "distance") {
            const metres = toBase(value, unitKey);

            const km = metres / 1000;
            const miles = metres / 1609.344;
            const stepsCount = metres / assumptions.step;

            if (unitKey !== "km") {
                steps.push({
                    label: "Distance",
                    value: km,
                    unit: "kilometres",
                    description: "That's the same distance in kilometres."
                });
            }

            if (unitKey !== "miles") {
                steps.push({
                    label: "Distance",
                    value: miles,
                    unit: "miles",
                    description: "That's the same distance in miles."
                });
            }

            steps.push({
                label: "Walking",
                value: stepsCount,
                unit: "steps",
                description:
                    `Using an average step length of ${assumptions.step} m.`
            });

            steps.push({
                label: "Big scale",
                value: metres / 1000000,
                unit: "million metres",
                description:
                    "A quick way to see how large the number gets."
            });
        }

        if (category === "weight") {
            const grams = toBase(value, unitKey);
            const kg = grams / 1000;

            steps.push({
                label: "Kilograms",
                value: kg,
                unit: "kg",
                description: "The same mass in kilograms."
            });

            steps.push({
                label: "Pounds",
                value: grams / 453.59237,
                unit: "lb",
                description: "The same mass in pounds."
            });

            steps.push({
                label: "Sugar",
                value: kg,
                unit: "1 kg bags of sugar",
                description:
                    "Roughly, assuming a 1 kg bag."
            });

            steps.push({
                label: "Water",
                value: kg,
                unit: "litres of water",
                description:
                    "Water is approximately 1 kg per litre."
            });
        }

        if (category === "data") {
            const bytes = toBase(value, unitKey);

            steps.push({
                label: "Gigabytes",
                value: bytes / 1e9,
                unit: "GB",
                description:
                    "The same amount of data in gigabytes."
            });

            steps.push({
                label: "Terabytes",
                value: bytes / 1e12,
                unit: "TB",
                description:
                    "The same amount of data in terabytes."
            });

            steps.push({
                label: "Photos",
                value: bytes / 4e6,
                unit: "4 MB photos",
                description:
                    "Estimate using 4 MB per photo."
            });

            steps.push({
                label: "HD films",
                value: bytes / 5e9,
                unit: "5 GB films",
                description:
                    "Estimate using 5 GB per HD film."
            });

            steps.push({
                label: "Songs",
                value: bytes / 5e6,
                unit: "5 MB songs",
                description:
                    "Estimate using 5 MB per song."
            });
        }

        if (category === "calories") {
            const calories = toBase(value, unitKey);

            steps.push({
                label: "Daily energy",
                value: calories / 2500,
                unit: "2,500-calorie days",
                description:
                    "Equivalent energy using 2,500 kcal per day."
            });

            steps.push({
                label: "Big Macs",
                value: calories / 550,
                unit: "Big Macs",
                description:
                    "Very rough energy comparison."
            });

            steps.push({
                label: "Chocolate bars",
                value: calories / 230,
                unit: "chocolate bars",
                description:
                    "Estimate using 230 kcal per bar."
            });

            steps.push({
                label: "Pizza",
                value: calories / 1000,
                unit: "pizzas",
                description:
                    "Estimate using 1,000 kcal per pizza."
            });
        }

        if (category === "energy") {
            const joules = toBase(value, unitKey);
            const kwh = joules / 3600000;

            steps.push({
                label: "Kilowatt-hours",
                value: kwh,
                unit: "kWh",
                description:
                    "The same energy in electricity terms."
            });

            steps.push({
                label: "Phone charges",
                value: (kwh * 1000) / 15,
                unit: "phone charges",
                description:
                    "Estimate using 15 Wh per full charge."
            });

            steps.push({
                label: "Kettle boils",
                value: (kwh * 1000) / 100,
                unit: "kettle boils",
                description:
                    "Estimate using 100 Wh per boil."
            });

            steps.push({
                label: "LED bulb",
                value: (kwh * 1000) / 10,
                unit: "hours of a 10 W LED",
                description:
                    "Estimate using a 10 W LED bulb."
            });
        }

        if (category === "money") {
            const gbp = toBase(value, unitKey);

            steps.push({
                label: "British pounds",
                value: gbp,
                unit: "£",
                description:
                    "Using the site's approximate exchange assumptions."
            });

            steps.push({
                label: "Work",
                value: gbp / assumptions.wage,
                unit: "hours of work",
                description:
                    `At £${assumptions.wage.toFixed(2)} per hour.`
            });

            steps.push({
                label: "Coffee",
                value: gbp / assumptions.coffee,
                unit: "coffees",
                description:
                    `At £${assumptions.coffee.toFixed(2)} each.`
            });

            steps.push({
                label: "Takeaways",
                value: gbp / assumptions.meal,
                unit: "takeaway meals",
                description:
                    `At £${assumptions.meal.toFixed(2)} each.`
            });

            steps.push({
                label: "Rent",
                value: gbp / assumptions.rent,
                unit: "days of rent",
                description:
                    `At £${assumptions.rent.toFixed(2)} per day.`
            });
        }

        return steps;
    }

    function renderJourney(steps) {
        if (!conversionJourney) return;

        conversionJourney.innerHTML = "";

        steps.forEach((step, index) => {
            const article = document.createElement("article");

            article.className = "conversion-step";
            article.style.animationDelay = `${index * 70}ms`;

            article.innerHTML = `
                <div class="step-label">
                    ${escapeHTML(step.label)}
                </div>

                <div class="step-value">
                    ${formatNumber(step.value)}
                    ${escapeHTML(step.unit)}
                </div>

                <div class="step-description">
                    ${escapeHTML(step.description)}
                </div>
            `;

            conversionJourney.appendChild(article);
        });
    }

    function generateComparisons(value, unitKey) {
        const unit = units[unitKey];

        if (!unit) return [];

        const category = unit.category;

        if (category === "time") {
            const seconds = toBase(value, unitKey);

            return [
                {
                    icon: "♫",
                    label: "Songs",
                    value: seconds / 210,
                    note: "At roughly 3½ minutes per song."
                },
                {
                    icon: "▶",
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
                    icon: "☕",
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

        if (category === "money") {
            const gbp = toBase(value, unitKey);

            return [
                {
                    icon: "☕",
                    label: "Coffees",
                    value: gbp / assumptions.coffee,
                    note: `At £${assumptions.coffee.toFixed(2)} each.`
                },
                {
                    icon: "🍔",
                    label: "Big Macs",
                    value: gbp / assumptions.burger,
                    note: `At £${assumptions.burger.toFixed(2)} each.`
                },
                {
                    icon: "🍕",
                    label: "Takeaways",
                    value: gbp / assumptions.meal,
                    note: `At £${assumptions.meal.toFixed(2)} each.`
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
                    note: `At £${assumptions.rent.toFixed(2)} per day.`
                },
                {
                    icon: "🎮",
                    label: "Game consoles",
                    value: gbp / assumptions.console,
                    note: `At £${assumptions.console.toFixed(0)} each.`
                }
            ];
        }

        if (category === "distance") {
            const metres = toBase(value, unitKey);
            const miles = metres / 1609.344;

            return [
                {
                    icon: "👣",
                    label: "Steps",
                    value: metres / assumptions.step,
                    note: `Using ${assumptions.step} m per step.`
                },
                {
                    icon: "🏟",
                    label: "Football pitches",
                    value: metres / 105,
                    note: "Using a 105 m pitch."
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
                    value: metres / 40075017,
                    note: "Using Earth's approximate circumference."
                },
                {
                    icon: "🚶",
                    label: "Hours walking",
                    value: miles / 3,
                    note: "Using roughly 3 mph walking speed."
                },
                {
                    icon: "🚌",
                    label: "London bus lengths",
                    value: metres / 11,
                    note: "Roughly 11 m per bus."
                }
            ];
        }

        if (category === "weight") {
            const kg = toBase(value, unitKey) / 1000;

            return [
                {
                    icon: "👤",
                    label: "Adults",
                    value: kg / 75,
                    note: "Using 75 kg as a simple reference."
                },
                {
                    icon: "🍬",
                    label: "1 kg sugar bags",
                    value: kg,
                    note: "One bag = 1 kg."
                },
                {
                    icon: "💧",
                    label: "Litres of water",
                    value: kg,
                    note: "Approximately 1 kg per litre."
                },
                {
                    icon: "🐕",
                    label: "Large dogs",
                    value: kg / 30,
                    note: "Using 30 kg as a rough reference."
                },
                {
                    icon: "🧱",
                    label: "Bricks",
                    value: kg / 2.5,
                    note: "Using roughly 2.5 kg per brick."
                }
            ];
        }

        if (category === "data") {
            const bytes = toBase(value, unitKey);

            return [
                {
                    icon: "📷",
                    label: "Photos",
                    value: bytes / 4e6,
                    note: "Estimate: 4 MB per photo."
                },
                {
                    icon: "🎬",
                    label: "HD films",
                    value: bytes / 5e9,
                    note: "Estimate: 5 GB per film."
                },
                {
                    icon: "♫",
                    label: "Songs",
                    value: bytes / 5e6,
                    note: "Estimate: 5 MB per song."
                },
                {
                    icon: "🎧",
                    label: "Years of music",
                    value: bytes / 5e6 / 210 / 24 / 365,
                    note:
                        "Estimate using 5 MB songs averaging 3½ minutes."
                },
                {
                    icon: "💾",
                    label: "1 TB drives",
                    value: bytes / 1e12,
                    note:
                        "Same data expressed as 1 TB drives."
                }
            ];
        }

        if (category === "calories") {
            const calories = toBase(value, unitKey);

            return [
                {
                    icon: "📅",
                    label: "2,500-calorie days",
                    value: calories / 2500,
                    note: "Simple energy comparison."
                },
                {
                    icon: "🍔",
                    label: "Big Macs",
                    value: calories / 550,
                    note: "Approximate energy comparison."
                },
                {
                    icon: "🍫",
                    label: "Chocolate bars",
                    value: calories / 230,
                    note: "Approximate energy comparison."
                },
                {
                    icon: "🍕",
                    label: "Pizzas",
                    value: calories / 1000,
                    note: "Approximate energy comparison."
                }
            ];
        }

        if (category === "energy") {
            const joules = toBase(value, unitKey);
            const kwh = joules / 3600000;

            return [
                {
                    icon: "📱",
                    label: "Phone charges",
                    value: kwh * 1000 / 15,
                    note: "Estimate: 15 Wh per charge."
                },
                {
                    icon: "♨",
                    label: "Kettle boils",
                    value: kwh * 1000 / 100,
                    note: "Estimate: 100 Wh per boil."
                },
                {
                    icon: "🚿",
                    label: "Showers",
                    value: kwh / 2.5,
                    note: "Estimate: 2.5 kWh per shower."
                },
                {
                    icon: "💡",
                    label: "LED bulb hours",
                    value: kwh * 1000 / 10,
                    note: "Estimate using a 10 W bulb."
                },
                {
                    icon: "🚗",
                    label: "Electric car miles",
                    value: kwh / 0.3,
                    note: "Estimate using 300 Wh per mile."
                }
            ];
        }

        return [];
    }

    function renderComparisons(comparisons) {
        if (!comparisonGrid) return;

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

    let currentValue = 10000;
    let currentUnit = "hours";

    function randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function showWeirdComparison() {
        const unit = units[currentUnit];

        if (!unit) return;

        const category = unit.category;
        let result;

        if (category === "money") {
            const gbp = toBase(currentValue, currentUnit);

            result = randomItem([
                {
                    title: "That's a lot of coffee.",
                    description:
                        `You could buy about ${formatNumber(
                            gbp / assumptions.coffee
                        )} coffees.`
                },
                {
                    title: "That's a suspicious amount of Big Macs.",
                    description:
                        `At £${assumptions.burger.toFixed(2)} each, that's about ${formatNumber(
                            gbp / assumptions.burger
                        )} Big Macs.`
                },
                {
                    title: "That's a lot of working hours.",
                    description:
                        `At £${assumptions.wage.toFixed(2)}/hour, that's about ${formatNumber(
                            gbp / assumptions.wage
                        )} hours of work.`
                }
            ]);
        } else if (category === "time") {
            const seconds = toBase(currentValue, currentUnit);

            result = randomItem([
                {
                    title: "That's a lot of songs.",
                    description:
                        `Roughly ${formatNumber(
                            seconds / 210
                        )} average-length songs.`
                },
                {
                    title: "That's a worrying number of films.",
                    description:
                        `About ${formatNumber(
                            seconds / 7200
                        )} two-hour films.`
                },
                {
                    title: "That's a lot of sleep.",
                    description:
                        `Equivalent to about ${formatNumber(
                            seconds / 28800
                        )} eight-hour nights.`
                }
            ]);
        } else if (category === "distance") {
            const metres = toBase(currentValue, currentUnit);

            result = randomItem([
                {
                    title: "That's a lot of walking.",
                    description:
                        `About ${formatNumber(
                            metres / assumptions.step
                        )} steps.`
                },
                {
                    title: "That's a ridiculous number of football pitches.",
                    description:
                        `Roughly ${formatNumber(
                            metres / 105
                        )} pitches end-to-end.`
                },
                {
                    title: "That's marathon territory.",
                    description:
                        `About ${formatNumber(
                            metres / 42195
                        )} marathons.`
                }
            ]);
        } else if (category === "data") {
            const bytes = toBase(currentValue, currentUnit);

            result = randomItem([
                {
                    title: "That's a lot of photos.",
                    description:
                        `Roughly ${formatNumber(
                            bytes / 4e6
                        )} photos at 4 MB each.`
                },
                {
                    title: "That's an unreasonable music library.",
                    description:
                        `Roughly ${formatNumber(
                            bytes / 5e6
                        )} songs at 5 MB each.`
                },
                {
                    title: "That's a serious film collection.",
                    description:
                        `Around ${formatNumber(
                            bytes / 5e9
                        )} HD films at 5 GB each.`
                }
            ]);
        } else {
            result = {
                title: "Okay... that's getting ridiculous.",
                description:
                    "Try another category for a stranger comparison."
            };
        }

        const title = $("#weirdTitle");
        const description = $("#weirdDescription");
        const weirdResult = $("#weirdResult");

        if (!title || !description || !weirdResult) return;

        title.textContent = result.title;
        description.textContent = result.description;
        weirdResult.hidden = false;

        weirdResult.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    function convert(shouldScroll = true) {
        if (!mainInput || !unitSelect) return;

        const value = Number(mainInput.value);
        const unitKey = unitSelect.value;

        if (!Number.isFinite(value) || value < 0) {
            showToast("Enter a valid number.");
            mainInput.focus();
            return;
        }

        currentValue = value;
        currentUnit = unitKey;

        const unit = units[unitKey];

        if (resultsTitle) {
            resultsTitle.textContent =
                `${formatNumber(value)} ${unit.label.toLowerCase()}`;
        }

        renderJourney(buildJourney(value, unitKey));
        renderComparisons(
            generateComparisons(value, unitKey)
        );

        if (resultsSection) {
            resultsSection.hidden = false;

            if (shouldScroll) {
                resultsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }

        /*
         * IMPORTANT:
         * Do not add ?value=...&unit=... to the URL.
         * The homepage always stays:
         *
         * https://24uz.github.io/everything-converter/
         */
        resetURL();
    }

    function resetURL() {
        const cleanPath = "/everything-converter/";

        if (
            window.location.pathname !== cleanPath ||
            window.location.search ||
            window.location.hash
        ) {
            history.replaceState(
                null,
                "",
                cleanPath
            );
        }
    }

    async function copyResult() {
        const unit = units[currentUnit];
        const journey = buildJourney(
            currentValue,
            currentUnit
        );

        let text =
            `${formatNumber(currentValue)} ${unit.label.toLowerCase()}`;

        journey.slice(1, 4).forEach((step) => {
            text +=
                ` → ${formatNumber(step.value)} ${step.unit}`;
        });

        const copyText =
            `Everything Converter\n${text}`;

        try {
            await navigator.clipboard.writeText(copyText);
            showToast("Result copied.");
        } catch {
            fallbackCopy(copyText);
        }
    }

    function fallbackCopy(text) {
        const textarea =
            document.createElement("textarea");

        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.select();

        try {
            document.execCommand("copy");
            showToast("Result copied.");
        } catch {
            showToast("Couldn't copy automatically.");
        }

        textarea.remove();
    }

    async function shareResult() {
        const unit = units[currentUnit];
        const journey = buildJourney(
            currentValue,
            currentUnit
        );

        let text =
            `${formatNumber(currentValue)} ${unit.label.toLowerCase()}`;

        journey.slice(1, 4).forEach((step) => {
            text +=
                ` → ${formatNumber(step.value)} ${step.unit}`;
        });

        const shareText =
            `Everything Converter\n${text}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Everything Converter",
                    text: shareText,
                    url: "https://24uz.github.io/everything-converter/"
                });
                return;
            } catch {
                return;
            }
        }

        await copyResult();
    }

    const surprisePresets = [
        ["1000000", "seconds"],
        ["100000", "gbp"],
        ["1000", "miles"],
        ["10", "tb"],
        ["10000", "hours"],
        ["1000000000", "seconds"],
        ["500", "kg"],
        ["1000000", "calories"],
        ["100", "gbp"],
        ["50000", "metres"]
    ];

    function surpriseMe() {
        const preset = randomItem(surprisePresets);

        mainInput.value = preset[0];
        unitSelect.value = preset[1];

        updateInputSymbol();
        convert();
    }

    function setupExamples() {
        $$(".example-chip").forEach((button) => {
            button.addEventListener("click", () => {
                mainInput.value = button.dataset.value;
                unitSelect.value = button.dataset.unit;

                updateInputSymbol();
                convert();
            });
        });
    }

    function setupExplore() {
        $$(".explore-card").forEach((card) => {
            card.addEventListener("click", () => {
                mainInput.value = card.dataset.value;
                unitSelect.value = card.dataset.unit;

                updateInputSymbol();
                convert();
            });
        });
    }

    function setupTheme() {
        const button = $("#themeToggle");
        const icon = $("#themeIcon");

        if (!button) return;

        const saved =
            localStorage.getItem(
                "everything-converter-theme"
            );

        if (saved === "dark") {
            document.documentElement.dataset.theme =
                "dark";
        }

        updateThemeIcon();

        button.addEventListener("click", () => {
            const isDark =
                document.documentElement.dataset.theme ===
                "dark";

            if (isDark) {
                delete document.documentElement.dataset.theme;

                localStorage.setItem(
                    "everything-converter-theme",
                    "light"
                );
            } else {
                document.documentElement.dataset.theme =
                    "dark";

                localStorage.setItem(
                    "everything-converter-theme",
                    "dark"
                );
            }

            updateThemeIcon();
        });

        function updateThemeIcon() {
            const isDark =
                document.documentElement.dataset.theme ===
                "dark";

            if (icon) {
                icon.textContent =
                    isDark ? "☀" : "☾";
            }

            button.setAttribute(
                "aria-label",
                isDark
                    ? "Switch to light theme"
                    : "Switch to dark theme"
            );
        }
    }

    function setupAssumptions() {
        const toggle = $("#assumptionsToggle");
        const content = $("#assumptionsContent");
        const apply = $("#applyAssumptions");

        if (toggle && content) {
            toggle.addEventListener("click", () => {
                const open =
                    toggle.getAttribute(
                        "aria-expanded"
                    ) === "true";

                toggle.setAttribute(
                    "aria-expanded",
                    String(!open)
                );

                content.hidden = open;

                toggle.textContent =
                    open ? "+" : "−";
            });
        }

        if (apply) {
            apply.addEventListener("click", () => {
                const wage =
                    Number($("#assumeWage")?.value);

                const coffee =
                    Number($("#assumeCoffee")?.value);

                const meal =
                    Number($("#assumeMeal")?.value);

                const subscription =
                    Number($("#assumeSubscription")?.value);

                const rent =
                    Number($("#assumeRent")?.value);

                const consolePrice =
                    Number($("#assumeConsole")?.value);

                const burger =
                    Number($("#assumeBurger")?.value);

                const step =
                    Number($("#assumeStep")?.value);

                if (wage > 0) assumptions.wage = wage;
                if (coffee > 0) assumptions.coffee = coffee;
                if (meal > 0) assumptions.meal = meal;

                if (subscription > 0) {
                    assumptions.subscription =
                        subscription;
                }

                if (rent > 0) assumptions.rent = rent;

                if (consolePrice > 0) {
                    assumptions.console =
                        consolePrice;
                }

                if (burger > 0) {
                    assumptions.burger = burger;
                }

                if (step > 0) {
                    assumptions.step = step;
                }

                showToast("Assumptions applied.");

                if (
                    resultsSection &&
                    !resultsSection.hidden
                ) {
                    convert(false);
                }
            });
        }
    }

    let toastTimer;

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
    }

    function setupKeyboard() {
        if (!mainInput) return;

        mainInput.addEventListener(
            "keydown",
            (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    convert();
                }
            }
        );
    }

    function setupNavigation() {
        $$(".nav-links a").forEach((link) => {
            link.addEventListener("click", () => {
                const href =
                    link.getAttribute("href");

                if (!href || href === "#") return;

                const target =
                    document.querySelector(href);

                if (target) {
                    target.scrollIntoView({
                        behavior: "smooth"
                    });
                }
            });
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

    /* EVENTS */

    if (converterForm) {
        converterForm.addEventListener(
            "submit",
            (event) => {
                event.preventDefault();
                convert();
            }
        );
    }

    if (unitSelect) {
        unitSelect.addEventListener(
            "change",
            updateInputSymbol
        );
    }

    const copyButton = $("#copyResult");

    if (copyButton) {
        copyButton.addEventListener(
            "click",
            copyResult
        );
    }

    const shareButton = $("#shareResult");

    if (shareButton) {
        shareButton.addEventListener(
            "click",
            shareResult
        );
    }

    const weirdButton = $("#weirdButton");

    if (weirdButton) {
        weirdButton.addEventListener(
            "click",
            showWeirdComparison
        );
    }

    const anotherWeird = $("#anotherWeird");

    if (anotherWeird) {
        anotherWeird.addEventListener(
            "click",
            showWeirdComparison
        );
    }

    const surpriseButton = $("#surpriseButton");

    if (surpriseButton) {
        surpriseButton.addEventListener(
            "click",
            surpriseMe
        );
    }

    /* START */

    populateUnits("hours");
    setupExamples();
    setupExplore();
    setupTheme();
    setupAssumptions();
    setupKeyboard();
    setupNavigation();

    if (mainInput) {
        mainInput.value = "10000";
    }

    if (unitSelect) {
        unitSelect.value = "hours";
    }

    updateInputSymbol();

    /*
     * Always start from the clean homepage.
     */
    resetURL();

})();