<script>
    const jobs = [
    {position: "IT Support Technician", company: "Updaze Tech", closing: "30 Sep 2026" },
    {position: "Junior Web Developer", company: "Digital Labs", closing: "15 Oct 2026" }
    ];


    const table = document.getElementById("jobsTable");
    if (table) {
        table.innerHTML = jobs.map(job => `
<tr>
<td>${job.position}</td>
<td>${job.company}</td>
<td>${job.closing}</td>
<td><button class="btn btn-sm btn-primary">View Details</button></td>
</tr>
`).join("");
}
</script>