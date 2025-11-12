export interface UpcomingProject {
    name: string;
    developer: string;
    location: string;
    investmentBillion: number;
    itCapacityGW?: number;
    itCapacityMW?: number;
    status: string;
}

export const upcomingProjects: UpcomingProject[] = [
    {
        name: "Stargate AI Project",
        developer: "OpenAI & Oracle",
        location: "Abilene, Texas (and other states)",
        investmentBillion: 100,
        itCapacityGW: 4.5,
        status: "Announced"
    },
    {
        name: "Vantage Frontier Texas",
        developer: "Vantage Data Centers",
        location: "Shackelford County, Texas",
        investmentBillion: 25,
        itCapacityGW: 1.4,
        status: "Announced"
    },
    {
        name: "Amazon PA AI Campuses",
        developer: "AWS",
        location: "Salem & Falls Twps, PA",
        investmentBillion: 20,
        status: "Announced / Permitting"
    },
    {
        name: "Amazon NC Campuses",
        developer: "AWS",
        location: "Multiple NC counties",
        investmentBillion: 10,
        status: "Announced"
    },
    {
        name: "Meta Monroe Louisiana",
        developer: "Meta Platforms",
        location: "Richland Parish, LA",
        investmentBillion: 10,
        status: "Under Construction"
    },
    {
        name: "Compass Meridian Campus",
        developer: "Compass Datacenters",
        location: "Lauderdale County, MS",
        investmentBillion: 10,
        itCapacityMW: 320,
        status: "Under Construction (phased)"
    },
    {
        name: "Cologix Johnstown",
        developer: "Cologix",
        location: "Johnstown, Ohio",
        investmentBillion: 7,
        itCapacityMW: 800,
        status: "Planned"
    },
    {
        name: "Microsoft Mount Pleasant",
        developer: "Microsoft",
        location: "Racine County, WI",
        investmentBillion: 3.3,
        status: "Site prep / Under Construction"
    },
    {
        name: "Google Fort Wayne Campus",
        developer: "Google",
        location: "Fort Wayne, Indiana",
        investmentBillion: 2,
        status: "Under Construction"
    }
];
