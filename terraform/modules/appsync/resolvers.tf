# DynamoDB Data Source
resource "aws_appsync_datasource" "notifications" {
  api_id           = aws_appsync_graphql_api.main.id
  name             = "NotificationsTable"
  type             = "AMAZON_DYNAMODB"
  service_role_arn = aws_iam_role.appsync_dynamodb.arn

  dynamodb_config {
    table_name = var.notifications_table_name
    region     = data.aws_region.current.name
  }
}

# Resolvers
resource "aws_appsync_resolver" "get_notifications" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Query"
  field       = "getNotifications"
  data_source = aws_appsync_datasource.notifications.name
  
  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation": "Query",
  "query": {
    "expression": "#targetRole = :targetRole",
    "expressionNames": {
      "#targetRole": "targetRole"
    },
    "expressionValues": {
      ":targetRole": $util.dynamodb.toDynamoDBJson($ctx.args.role)
    }
  },
  "index": "RoleIndex",
  "scanIndexForward": false,
  "limit": $util.defaultIfNull($ctx.args.limit, 20)
}
EOF

  response_template = <<EOF
$util.toJson($ctx.result.items)
EOF
}

resource "aws_appsync_resolver" "get_user_notifications" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Query"
  field       = "getUserNotifications"
  data_source = aws_appsync_datasource.notifications.name
  
  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation": "Query",
  "query": {
    "expression": "#userId = :userId",
    "expressionNames": {
      "#userId": "userId"
    },
    "expressionValues": {
      ":userId": $util.dynamodb.toDynamoDBJson($ctx.args.userId)
    }
  },
  "index": "UserIndex",
  "scanIndexForward": false,
  "limit": $util.defaultIfNull($ctx.args.limit, 20)
}
EOF

  response_template = <<EOF
$util.toJson($ctx.result.items)
EOF
}

resource "aws_appsync_resolver" "create_notification" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "createNotification"
  data_source = aws_appsync_datasource.notifications.name
  
  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation": "PutItem",
  "key": {
    "notificationId": $util.dynamodb.toDynamoDBJson($util.autoId()),
    "createdAt": $util.dynamodb.toDynamoDBJson($util.time.nowISO8601())
  },
  "attributeValues": {
    "title": $util.dynamodb.toDynamoDBJson($ctx.args.input.title),
    "description": $util.dynamodb.toDynamoDBJson($util.defaultIfNull($ctx.args.input.description, null)),
    "author": $util.dynamodb.toDynamoDBJson($ctx.args.input.author),
    "link": $util.dynamodb.toDynamoDBJson($util.defaultIfNull($ctx.args.input.link, null)),
    "targetRole": $util.dynamodb.toDynamoDBJson($ctx.args.input.targetRole),
    "userId": $util.dynamodb.toDynamoDBJson($util.defaultIfNull($ctx.args.input.userId, null)),
    "read": $util.dynamodb.toDynamoDBJson(false)
  }
}
EOF

  response_template = <<EOF
#if($ctx.error)
  $util.error($ctx.error.message, $ctx.error.type)
#end
$util.toJson($ctx.result)
EOF
}

resource "aws_appsync_resolver" "mark_notification_as_read" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "markNotificationAsRead"
  data_source = aws_appsync_datasource.notifications.name
  
  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation": "UpdateItem",
  "key": {
    "notificationId": $util.dynamodb.toDynamoDBJson($ctx.args.notificationId),
    "createdAt": $util.dynamodb.toDynamoDBJson($ctx.args.createdAt)
  },
  "update": {
    "expression": "SET #read = :read",
    "expressionNames": {
      "#read": "read"
    },
    "expressionValues": {
      ":read": $util.dynamodb.toDynamoDBJson(true)
    }
  },
  "returnValues": "ALL_NEW"
}
EOF

  response_template = <<EOF
$util.toJson($ctx.result)
EOF
}

resource "aws_appsync_resolver" "on_create_notification" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Subscription"
  field       = "onCreateNotification"
  
  request_template = <<EOF
{
  "version": "2018-05-29",
  "payload": null
}
EOF

  response_template = <<EOF
$util.toJson($ctx.result)
EOF
}

resource "aws_appsync_resolver" "on_create_user_notification" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Subscription"
  field       = "onCreateUserNotification"
  
  request_template = <<EOF
{
  "version": "2018-05-29",
  "payload": null
}
EOF

  response_template = <<EOF
$util.toJson($ctx.result)
EOF
}