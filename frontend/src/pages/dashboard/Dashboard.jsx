import React from "react";
import StatCard from "../../components/dashboard/StatCard";

const Dashboard = () => {
    return (
        <>
            <div className="d-flex gap-3">
                <StatCard></StatCard>
                <StatCard></StatCard>
                <StatCard></StatCard>
                <StatCard></StatCard>
            </div>
        </>
    );
};

export default Dashboard;
