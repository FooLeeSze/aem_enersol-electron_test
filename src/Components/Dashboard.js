import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import '../Styles/dashboard.css'


export default function DashBoard() {

    // Dasboard data API url
    const dataApiUrl = 'http://test-demo.aemenersol.com/api/dashboard';

    const navigate = useNavigate();

    // Intialize dashboard data & login state
    const [dashData, setDashData] = useState(null);
    const [loggedIn , setLoggedIn] = useState(false)

    // Set refs for the bar and donut charts
    const barChart = useRef();
    const donutChart = useRef();
    

    function fetchDashData(url, token) {

        // Fetch dashboard data from API endpoint using Bearer token from login
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }

        }).then(response => {
            if(response.ok) {
                return response.json()
            }
            return Promise.reject(response)
            
        }).then(data => {
            // If successful, set dashboard data
            setDashData(data)

        }).catch(response => {
            // If not successful, log status in console
            console.log(response.status, response.statusText)
        })
    }

    
    function handleSignOut() {
        // Delete bearer token upon signing out
        sessionStorage.removeItem('accessToken')
        setLoggedIn(false)
    }

    
    function plotBarChart(ref, data) {
        // Select donut chart svg element
        const chart = d3.select(ref.current)

        // Clear existing svg content
        chart.selectAll("*").remove();

        // Define dimensions
        const w = document.getElementsByClassName("bar-chart")[0].getClientRects()[0].width
        const h = document.getElementsByClassName("bar-chart")[0].getClientRects()[0].height
        const padding = 50;
        const paddingOut = 0.2;
        const paddingIn = 0.5;

        // Define linear x & y linear scales
        const yScaleBar = d3.scaleLinear()
                            .domain([0, d3.max(data, d => d.value)])
                            .range([h-padding, padding])
        const xScaleBar = d3.scaleBand()
                            .domain(data.map(d => d.name))
                            .range([padding, w-padding])
                            .paddingInner(paddingIn)
                            .paddingOuter(paddingOut)
        const xAxisScale = d3.scaleBand()
                            .domain(data.map(d => d.name))
                            .range([padding, w-padding])
                            .paddingInner(paddingIn)
                            .paddingOuter(paddingOut)

        // Plot bar chart
        chart.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
                .attr('class', 'bar')
                .attr('y', d => yScaleBar(d.value))
                .attr('x', d => xScaleBar(d.name))
                .attr('width', xScaleBar.bandwidth())
                .attr('height', d => h - padding - yScaleBar(d.value))

        // Add text labels
        chart.selectAll('text')
            .data(data)
            .enter()
            .append('text')
                .attr('y', d => yScaleBar(d.value) - 3)
                .attr('x', d => xScaleBar(d.name))
                .text(d => d.value)

        // Add axes
        const x_axis = d3.axisBottom().ticks(data.length).scale(xAxisScale)
        const y_axis = d3.axisLeft().scale(yScaleBar)
        chart.append('g').attr('class','axes').attr('transform', `translate(0, ${h-padding})`).call(x_axis)
        chart.append('g').attr('class','axes').attr('transform', `translate(${padding}, 0)`).call(y_axis)
    }

    
    function plotDonutChart(ref, data) {
        
        // Select donut chart svg element
        const chart = d3.select(ref.current)

        // Clear existing svg content
        chart.selectAll("*").remove();

        // Define dimensions
        const w = document.getElementsByClassName("donut-chart")[0].getClientRects()[0].width
        const h = document.getElementsByClassName("donut-chart")[0].getClientRects()[0].height
        const padding = 50;
        const radius = (Math.min(w , h) - 2*padding) / 2;
        const outerRadius = radius - radius * 0.1;
        const innerRadius = radius - radius * 0.5;

        // Define donut color scheme
        const color = d3.scaleOrdinal()
                        .domain(data)
                        .range(['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c'])

        // Define donut chart components
        const pie = d3.pie()
                    .sort(null)
                    .value(d => d.value)

        const arc = d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius)

        const outerArc = d3.arc()
                            .innerRadius(radius*1.1)
                            .outerRadius(radius*1.1)

        const arcs = pie(data)

        // Plot donut chart
        chart.selectAll('path')
            .data(arcs)
            .enter()
            .append('path')
                .attr('fill', (d,i) => color(i))
                .attr('transform', `translate(${w/2}, ${h/2})`)
                .attr('stroke', 'white')
                .attr('d', arc)

        // Add text labels
        chart.selectAll('polyline')
            .data(arcs)
            .enter()
            .append('polyline')
                .attr('stroke', 'black')
                .style('fill', 'none')
                .attr('stroke-width', 1)
                .attr('points', d => {
                    var posA = arc.centroid(d)
                    var posB = outerArc.centroid(d)
                    var posC = outerArc.centroid(d)
                    posC[0] = radius * 1.1 * (posB[0] > 0 ? 1: -1)

                    return [posA, posB, posC]
                })
                .attr('transform', `translate(${w/2}, ${h/2})`)
        
        chart.selectAll('valueLabels')
            .data(arcs)
            .enter()
            .append('text')
                .attr('transform', d => {
                    var pos = outerArc.centroid(d)
                    pos[0] = radius * 1.2 * (pos[0] > 0 ? 1 : -1.1)

                    return `translate(${pos}) translate(${w/2}, ${h/2})`
                })
            .text(d => d.value)

        chart.selectAll('nameLabels')
        .data(arcs)
        .enter()
        .append('text')
            .attr('transform', d => {
                var pos = outerArc.centroid(d)
                pos[0] = radius * 1.2 * (pos[0] > 0 ? 1 : -1.4)
                pos[1] = pos[1] + 20
                return `translate(${pos}) translate(${w/2}, ${h/2})`
            })
        .text((d,i) =>`(${data[i].name})`)
    }

    // Check if use has already logged in
    useEffect(() => {
        const token = sessionStorage.getItem('accessToken');
        
        if (token == null) {
            // If there is no token, go back to sign in page
            navigate('/')
        } else {
            // If token exists, fetch dashboard data
            fetchDashData(dataApiUrl, token)
            setLoggedIn(true)
        }

    }, [loggedIn])

    // Plot charts once component mounted & when window is resized
    useEffect(() => {
        if (dashData != null) {

            // Re-plot charts upon window resizing
            function handleResize() {
                plotBarChart(barChart, dashData.chartBar)
                plotDonutChart(donutChart, dashData.chartDonut) 
            }

            window.addEventListener('resize', handleResize)
            handleResize();

            return () => window.removeEventListener('resize', handleResize)
        }
    }, [dashData])


    return (
        <div id="dashboard">
            <nav id="dash-nav">
                <h2 id="nav-title">Dashboard</h2>
                <button id="sign-out-btn" onClick={handleSignOut}><FontAwesomeIcon icon={faArrowRightFromBracket} className="sign-out-icon" />Sign out</button>
            </nav>
            <section id="content">
                {dashData && 
                    <div id="dash-main-container">
                        <h2 className="content-title">Overview</h2>
                        <div id="cards-container">
                            <div className="card">
                                <h3 className="card-title">Card Title</h3>
                                <svg className="chart donut-chart" height="300" width="100%" ref={donutChart} />
                            </div>
                            <div className="card">
                                <h3 className="card-title">Card Title</h3>
                                <svg className="chart bar-chart" height="300" width="100%" ref={barChart} />
                            </div>
                            
                        </div>
                        
                        <div>
                            <h2 className="content-title">User List</h2>
                            <table id="user-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>User Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashData.tableUsers.map((user, i) => {
                                        return (
                                            <tr key={i}>
                                                <td>{i+1}</td>
                                                <td>{user.firstName}</td>
                                                <td>{user.lastName}</td>
                                                <td>{`@${user.username}`}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                
                }
                
            </section>
            
        </div>
    )
}