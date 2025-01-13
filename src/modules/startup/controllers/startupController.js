const startUp = require("../models/startupModel");

exports.getFilteredStartUp = async (req, res) => {
    try{
        const filters = req.query;
        //Build the aggregation pipeline
        const pipeline = [];

        //search stage 
        if(filters.search){
            pipeline.push({
                $match: {
                    $text: { $search: filters.search},
                },
            });
        }

        //Filtering Stage
        if (filters.industry) pipeline.push({ $match: { industry: filters.industry } });
        if (filters.stage) pipeline.push({ $match: { stage: filters.stage} });
        if (filters.location) pipeline.push({ $match: { location: filters.location } });
        if (filters.minFunding || filters.maxFunding) {
            pipeline.push({
                $match: {
                    "fundingNeeds.amount": {
                        ...(filters.minFunding && { $gte: parseInt(filters.minFunding) }),
                        ...(filters.maxFunding && { $lte: parseInt(filters.maxFunding) }),
                    },
                },
            })
        }

        // If no filters are provided, return all startups (sorted by trendingScore by default)
        if (Object.keys(filters).length === 0) {
            pipeline.push({ $sort: { trendingScore: -1 } });
        }

        //projection stage to include only required fields
        pipeline.push({
            $project: {
                startupName: 1,
                industry: 1,
                stage: 1,
                fundingNeeds: 1,
                location: 1,
                trendingScore: 1,
            },
        });

        console.log('Aggregation Pipeline:', pipeline);

        //Excute the pipeline
        const startups = await startUp.aggregate(pipeline);

        res.status(200).json({success: true, data: startups});
    } catch(error){
        res.status(500).json({success: false, message: "Error fetching startups", error: error.message});
    }
};

exports.getTrendingStartup = async (req, res) => {
    try {
        // Fetch startups sorted by trendingScore in descending order
        const trendingStartups = await startUp.find()
          .sort({ trendingScore: -1 }) // Sort by descending order of trendingScore
          .limit(10); // Limit to top 10 trending startups
    
        res.status(200).json({ success: true, data: trendingStartups });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching trending startups', error: error.message });
    }
};


/* The trending score will be calculated only after 
the analytics for likes, comments, and shares are generated. 
*/