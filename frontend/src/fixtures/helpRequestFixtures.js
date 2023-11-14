const helpRequestFixtures = {
    oneHelpRequest: {
        "id": 1,
        "requesterEmail": "jgaucho@ucsb.edu",
        "teamId": "team-1",
        "teamOrBreakoutRoom": "table-1",
        "requestTime": "2021-10-13T12:00:00",
        "explanation": "I need help with team02",
        "solved": "false"
    },
    threeHelpRequest: [
        {
            "id": 1,
            "requesterEmail": "jgaucho1@ucsb.edu",
            "teamId": "team-1",
            "teamOrBreakoutRoom": "table-1",
            "requestTime": "2021-10-13T12:00:00",
            "explanation": "I need help with team02",
            "solved": "false"
        },
        {
            "id": 2,
            "requesterEmail": "jgaucho2@ucsb.edu",
            "teamId": "team-2",
            "teamOrBreakoutRoom": "table-2",
            "requestTime": "2021-11-13T12:00:00",
            "explanation": "I need help with team03",
            "solved": "false"
        },
        {
            "id": 3,
            "requesterEmail": "jgaucho3@ucsb.edu",
            "teamId": "team-3",
            "teamOrBreakoutRoom": "table-3",
            "requestTime": "2021-12-13T12:00:00",
            "explanation": "I need help with team04",
            "solved": "false"
        }
    ]
};


export { helpRequestFixtures };
