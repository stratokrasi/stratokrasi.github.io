const edu_lvl_code_to_color = new Map([
    ["1", "aqua"],
    ["2", "coral"],
    ["3", "darkkhaki"],
    ["4", "indigo"],
    ["5", "lightgreen"],
    ["6", "darkorange"],
    ["7", "darkgreen"],
    ["8", "steelblue"],
    ["-9", "lightgray"]
])

function filterDataByYear(data, year) {
    let filteredData = data;

    filteredData = filteredData.filter((d) => {
        if (d.Year === year) {
            return d
        }
    })
    return filteredData
}

function filterDataByEduLvl(data, eduLvl) {
    let filteredData = data;

    filteredData = filteredData.filter((d) => {
        if (d.Education_Level_Code === eduLvl) {
            return d
        }
    })
    return filteredData
}

function processData(data) {
    var dataP = d3.flatRollup(
        data,
        x => ({
            num_births: x.map(d => +d.Number_of_Births)
        }),
        d => d.State_Abbreviation,
        d => d.Education_Level_Code
    )

    const flattened = dataP.map(
        ([state_abbrev, edu_lvl, values]) => {
            total_births = d3.sum(values.num_births);
            return ({ state_abbrev, edu_lvl, total_births })
        });

    var grouped = d3.group(flattened, d => d.state_abbrev)
    processedData = []
    var flat = grouped.entries()
    for (let elem of flat) {
        let tmpMap = new Map()
        tmpMap.set("state", elem[0])
        for (let v of elem[1]) {
            tmpMap.set(v['edu_lvl'], v['total_births'])
        }
        processedData.push(Object.fromEntries(tmpMap))
    }

    var names = processedData.map(d => { return d.state; })
    var totals = processedData.map(d => {
        var total = 0;
        for (const [key, value] of Object.entries(d)) {
            if (key != "state") {
                total += value;
            }
        }
        return total;
    });

    const order = d3.range(processedData.length).sort((i, j) => totals[j] - totals[i]);

    var subgroups = ['1', '2', '3', '4', '5', '6', '7', '8', '-9'];

    const sums = processedData.map(d => {
        delete d.state
        return Object.values(d)
    });

    return Object.assign(d3.stack().keys(d3.range(subgroups.length))(d3.permute(sums, order)), {
        keys: subgroups,
        totals: d3.permute(totals, order),
        names: d3.permute(names, order)
    });
}