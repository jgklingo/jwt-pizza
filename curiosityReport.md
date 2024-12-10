# Curiosity Report - Infrastructure as Code and Amazon CloudFormation

## Summary

For my curiosity report, I chose to take a deep dive into infrastructure as code (IaC) and specifically how Amazon CloudFormation allows you to implement it. The automation of complex systems was one of my favorite parts of this class, and I felt like IaC would give me a better understanding of how that is done in the workplace. Moreover, I wanted to find a way to easily spin up and take down my JTW Pizza Service to save money on my RDS and ECS bills, and IaC/CloudFormation seemed like the best way to accomplish that.

## Changes to JWT Pizza

My goal was to change my JWT Pizza applications as little as possible to keep them compatible with future instruction, but I did have to make a few tweaks explained below. These had the added benefit of allowing me to learn more about a few other parts of AWS.

- To eliminate the need to specify the database URL to my JWT Pizza Service each time I restarted the database, I wanted to assign it a subdomain that I could use each time I spun up RDS. However, this subdomain needed to be accessible within my virtual private cloud and not accessible to the broader internet for security reasons. After doing some research, I discovered private hosted zones in Route53 and created one for my jgklingo.click domain. The private hosted zone allowed me to assign a subdomain to my database (pizza-db.jgklingo.click) and update the DNS record to point to my database each time I started it.

- This also required that I changed my production secrets in my clone of the JWT Pizza Service so that the service would always connect to the database at pizza-db.jgklingo.click.

- The last change I made was more of a quality of life change. All I did was modify the CI script to continue even if ECS deployment failed. I did this because if I pushed changes to my JWT Pizza Service when it was not running in AWS, it would trigger a failure in my deployment pipeline. After making this change, the entire pipeline no longer fails if the deployment to ECS fails because it isn't running.

## CloudFormation

The biggest challenge in converting my JWT Pizza Service to IaC was making sure that my CloudFormation template used all of the same configurations that I had used when I first created it manually. This required a lot of reading of CloudFormation documentation and even some help from generative AI. The final result can be found in the [CloudFormation folder](https://github.com/jgklingo/jwt-pizza-service/blob/main/cloudFormation/) of my clone of JWT Pizza Service. There are two separate CloudFormation templates:

- jwt-pizza-service.json - This template was given in the course instruction and I only made slight tweaks to it. The only major change was that the script now updates the pizza-service DNS record to point to the new load balancer automatically, eliminating that manual part of the process.

- jwt-pizza-db.json - This template takes a security group, subnet IDs, an instance password, a private hosted zone ID, and the database URL and uses it to create a database subnet group, RDS instance, and DNS record so the instance can be accessed by the service. The RDS instance portion of the template uses all of the same configurations that the original course instruction told us to use, including the correct instance class, security settings, username and password, and availability settings. I learned a ton about CloudFormation syntax and was surprised at its depth and functionality. One example is the existence of functions that allow you to modify inputs and parameters right in the template. I used the Select and GetAZs functions to get the first availability zone listed in my current region so I wouldn't have to hardcode it or enter it manually.

The final challenge was making these templates as easy as possible to activate. I did this by uploading them to S3, then creating a parameterized URL with all of the information needed to create the stack. Instead of manually having to locate the template and enter all of the parameters, I can now trigger stack creation in two clicks. These URLs are not committed to my repo because they contain sensitive configuration information about my JWT Pizza Service.

## Final Result

The config changes and two CloudFormation scripts allow me to spin up and take down my entire JWT Pizza Service in minutes, and almost all of that time is simply waiting for the services to start or stop in the background. The actual amount of human effort required can be measured in seconds. This has demonstrably reduced my costs, because I am able to shut down my service when it isn't needed and quickly bring it online to work on my assignments. My most expensive AWS bill was in October for $3.71, but since implementing this IaC, my bill has never exceeded $2. Assuming that the cost would be around $15 if I kept RDS and ECS running 24/7, this represents a cost savings of over 650%.
