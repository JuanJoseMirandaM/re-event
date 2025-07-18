output "graphql_api_id" {
  description = "ID of the AppSync GraphQL API"
  value       = aws_appsync_graphql_api.main.id
}

output "graphql_api_url" {
  description = "URL of the AppSync GraphQL API"
  value       = aws_appsync_graphql_api.main.uris["GRAPHQL"]
}

output "graphql_api_realtime_url" {
  description = "WebSocket URL for real-time subscriptions"
  value       = aws_appsync_graphql_api.main.uris["REALTIME"]
}