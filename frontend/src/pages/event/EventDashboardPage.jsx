import React from "react";
import StatCard from "../../components/dashboard/StatCard";

const EventDashboardPage = () => {
    return (
        <div className="d-flex gap-3">
            <StatCard
                title={"Ticket Sold"}
                content="0"
                subcontent={"No ticket sold"}
            />
            <StatCard
                title={"Ticket Sold"}
                content="0"
                subcontent={"No ticket sold"}
            />
            <StatCard
                title={"Ticket Sold"}
                content="0"
                subcontent={"No ticket sold"}
            />
            <StatCard
                title={"Ticket Sold"}
                content="0"
                subcontent={"No ticket sold"}
            />
        </div>
    );
};

export default EventDashboardPage;
