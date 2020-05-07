
const express=require('express');
const graphqlHTTP = require('express-graphql');
const graphql=require('graphql');
const {GraphQLObjectType,GraphQLString,GraphQLSchema,GraphQLID,GraphQLInt,GraphQLList,GraphQLNonNull} =graphql;
const _= require('lodash');
const mongoose = require('mongoose');
const Book = require('./models/book');
const Author = require('./models/Author');
const port = 3000

const app=express();

mongoose.connect('mongodb://localhost:27017/admin')
mongoose.connection.once('open', () => {
    console.log('conneted to database');
});


var books = [
    { name: 'Name of the Wind', genre: 'Fantasy', id: '1', authorId: '1' },
    { name: 'The Final Empire', genre: 'Fantasy', id: '2', authorId: '2' },
    { name: 'The Long Earth', genre: 'Sci-Fi', id: '3', authorId: '3' },
];


var authors = [
    { name: 'Patrick Rothfuss', age: 44, id: '1' },
    { name: 'Brandon Sanderson', age: 42, id: '2' },
    { name: 'Terry Pratchett', age: 66, id: '3' }
];

const BookType=new GraphQLObjectType({
    name:'Book',
    fields:()=>({
        id:{type:GraphQLID},
        name:{type:GraphQLString},
        genre:{type:GraphQLString},
        author:{
            type:AuthorType,
            resolve(parent,args){
                //return _.find(authors,{id:parent.authorId});
                return Author.findById(parent.authorId);
            }
        }
    })
});

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    fields: ( ) => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        book:{
            type:BookType,
            resolve(parent,args){
               // return _.find(books,{id:parent.id});
               return Book.find({ authorId: parent.id });
            }
        }
    })
});



const RootQuery =new GraphQLObjectType({
    name:'RootQueryType',
    fields:{
        book:{
            type:BookType,
            args:{id:{type:GraphQLID}},
            resolve(parent,args){
              // return _.find(books,{id:args.id});
              return Book.findById(args.id);
            }
        },
        author:{
            type: AuthorType,
            args:{id:{type:GraphQLID}},
            resolve(parent,args){
              //  return _.find(authors,{id:args.id});
              return Author.findById(args.id);
            }
        },

        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args){
               // return books;
               return Book.find({});
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args){
               // return authors;
               return Author.find({});
            }
        }
    }
})


const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addAuthor: {
            type: AuthorType,
            args: {
                name: { type: GraphQLString },
                age: { type: GraphQLInt }
            },
            resolve(parent, args){
                let author = new Author({
                    name: args.name,
                    age: args.age
                });
                return author.save();
            }
        },
        addBook: {
            type: BookType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                genre: { type: new GraphQLNonNull(GraphQLString) },
                authorId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args){
                let book = new Book({
                    name: args.name,
                    genre: args.genre,
                    authorId: args.authorId
                });
                return book.save();
            }
        }
    }
});


const schema= new GraphQLSchema({
    query:RootQuery,
    mutation: Mutation
});


app.use('/graphql', graphqlHTTP({
    schema,
    graphiql:true
}))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))