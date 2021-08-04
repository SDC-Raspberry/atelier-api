module.exports = {
  product: [
    {
      "_id": "60f269e74e488711cd4f6fb0",
      "id": 1,
      "name": "Camo Onesie",
      "slogan": "Blend in to your crowd",
      "description": "The So Fatigues will wake you up and fit you in. This high energy camo will have you blending in to even the wildest surroundings.",
      "category": "Jackets",
      "default_price": 140
    },
    {
      "_id": "60f269e74e488711cd4f6fae",
      "id": 2,
      "name": "Bright Future Sunglasses",
      "slogan": "You've got to wear shades",
      "description": "Where you're going you might not need roads, but you definitely need some shades. Give those baby blues a rest and let the future shine bright on these timeless lenses.",
      "category": "Accessories",
      "default_price": 69
    },
    {
      "_id": "60f269e74e488711cd4f6fb7",
      "id": 12,
      "name": "Belle Shirt",
      "slogan": "Debitis eos est provident ducimus similique saepe quo eos.",
      "description": "Qui nesciunt nesciunt consequuntur. Quia ut incidunt et quam sit rerum tempora. Placeat ipsa facere corporis et et quia repudiandae consequatur consequatur. Temporibus quae sapiente quae sed. Quisquam consequatur soluta.",
      "category": "Shirt",
      "default_price": 570
    },
  ],
  review: [
    {
      "_id": "60f2669cdd17092b96621d5e",
      "id": 2,
      "product_id": 1,
      "rating": 4,
      "date": 1610178433963,
      "summary": "This product was ok!",
      "body": "I really did not like this product solely because I am tiny and do not fit into it.",
      "recommend": false,
      "reported": false,
      "reviewer_name": "mymainstreammother",
      "reviewer_email": "first.last@gmail.com",
      "response": null,
      "helpfulness": 2
    },
    {
      "_id": "60f2669cdd17092b96621d5f",
      "id": 6,
      "product_id": 2,
      "rating": 5,
      "date": 1593564521722,
      "summary": "I'm not a fan!",
      "body": "I don't like them",
      "recommend": false,
      "reported": false,
      "reviewer_name": "negativity",
      "reviewer_email": "first.last@gmail.com",
      "response": "Sorry to hear. Is there anything in particular you don't like?",
      "helpfulness": 0
    },
    {
      "_id": "60f2669cdd17092b96621d71",
      "id": 20,
      "product_id": 12,
      "rating": 4,
      "date": 1599292503876,
      "summary": "Natus est in facilis ea accusantium exercitationem sunt.",
      "body": "Asperiores voluptates omnis nam tempore et est ea et fugit. Non aut tempore sint sit. Aspernatur eius accusamus sit repellendus velit. Consequatur harum corporis.",
      "recommend": true,
      "reported": false,
      "reviewer_name": "Sallie_Kovacek",
      "reviewer_email": "Magdalen49@yahoo.com",
      "response": null,
      "helpfulness": 4
    },
    {
      "_id": "60fad51d93cd1365f0ae7cae",
      "id": 18,
      "product_id": 12,
      "rating": 4,
      "date": 1605292482741,
      "summary": "Eligendi quae nihil nihil qui dolor ut.",
      "body": "Ullam nihil consequatur in magnam. Maiores vero quisquam facere dolorum eos est veritatis in id. Necessitatibus quos aut molestiae quia. Quae unde beatae.",
      "recommend": true,
      "reported": true,
      "reviewer_name": "Curtis_King46",
      "reviewer_email": "Dolly.Muller75@hotmail.com",
      "response": null,
      "helpfulness": 12
    },
    {
      "_id": "60fad51d93cd1365f0ae7cad",
      "id": 19,
      "product_id": 12,
      "rating": 2,
      "date": 1591265584988,
      "summary": "Delectus molestiae qui laborum possimus veritatis.",
      "body": "Et deserunt modi et perferendis unde impedit perferendis. Vel occaecati minus sunt inventore atque. Officia ratione vel ut laudantium eaque natus ut odio. Maxime voluptates vitae accusantium iure laborum ducimus sunt maiores nulla. Autem deserunt cumque doloremque rem fugiat.",
      "recommend": false,
      "reported": false,
      "reviewer_name": "Kip.Streich",
      "reviewer_email": "Kristy_Schiller@gmail.com",
      "response": null,
      "helpfulness": 13
    }
  ],
  reviewPhoto: [
    {
      "_id": "60f26b900c5d7307edaff019",
      "id": 13,
      "review_id": 20,
      "url": "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80"
    },
    {
      "_id": "60f26b900c5d7307edaff018",
      "id": 12,
      "review_id": 18,
      "url": "https://images.unsplash.com/photo-1529108750117-bcbad8bd25dd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=662&q=80"
    }
  ],
  characteristic: [
    { "_id": "60f26b5ddb39fa129c38e1b1",
      "id": 39,
      "product_id": 12,
      "name": "Fit"
    },
    { "_id": "60f26b5ddb39fa129c38e1b2",
      "id": 40,
      "product_id": 12,
      "name": "Length"
    },
    { "_id": "60f26b5ddb39fa129c38e1b3",
      "id": 41,
      "product_id": 12,
      "name": "Comfort"
    },
    { "_id": "60f26b5ddb39fa129c38e1b5",
      "id": 42,
      "product_id": 12,
      "name": "Quality"
    },
  ],
  characteristicReview: [
    {
      "_id": "60f26a764c3d859f2721f9dd",
      "id": 65,
      "characteristic_id": 42,
      "review_id": 20,
      "value": 4
    },
    {
      "_id": "60f26a764c3d859f2721f9eb",
      "id": 64,
      "characteristic_id": 41,
      "review_id": 20,
      "value": 2
    },
    {
      "_id": "60f26a764c3d859f2721f9f3",
      "id": 62,
      "characteristic_id": 39,
      "review_id": 20,
      "value": 2
    },
    {
      "_id": "60f26a764c3d859f2721fa92",
      "id": 63,
      "characteristic_id": 40,
      "review_id": 20,
      "value": 2
    },
    {
      "_id": "60f26a764c3d859f2721f9d5",
      "id": 54,
      "characteristic_id": 39,
      "review_id": 18,
      "value": 2
    },
    {
      "_id": "60f26a764c3d859f2721f9d7",
      "id": 55,
      "characteristic_id": 40,
      "review_id": 18,
      "value": 1
    },
    {
      "_id": "60f26a764c3d859f2721f9d8",
      "id": 56,
      "characteristic_id": 41,
      "review_id": 18,
      "value": 4
    },
    {
      "_id": "60f26a764c3d859f2721f9d9",
      "id": 57,
      "characteristic_id": 42,
      "review_id": 18,
      "value": 3
    }
  ],
}