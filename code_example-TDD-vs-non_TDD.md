## an example of how using TDD led to simpler code 
__Background__
I started working on this project prior to reading the book TDD with Python. In my initial work on the project I started immediately generating the models that I assumed that I would need to achieve my requiements. In the second instance I attempted to use the TDD method of outside-in development and thus the models were the last Model-View-Template architecture that I created

### Non TDD models

```
class Post(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="creator")
    content = models.CharField(max_length=160)
    pub_date = models.DateTimeField('date posted', default=timezone.now)

    class Meta:
        ordering = ["-pub_date"]

    @property
    def likes_count(self):
        return self.likes.filter(like_unlike=True).count()

    @property
    def unlikes_count(self):
        return self.likes.filter(like_unlike=False).count()

    def __str__(self):
        return f"{self.id} - By {self.creator}"


BOOL_CHOICES = ((True, "like"), (False, "unlike"))


class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    like_unlike = models.BooleanField(choices=BOOL_CHOICES, null=False)

    @property
    def like_unlike_wording(self):
        return "like" if self.like_unlike else "unlike"

    def clean(self):
        """Prevent User from liking/unliking their own post"""
        if self.user == self.post.creator:
            raise ValidationError(_(f"User cannot {self.like_unlike_wording} their own post"))

    class Meta:
        constraints = [
            # Prevent a user from liking/unliking the same post twice
            models.UniqueConstraint(fields=['user', 'post'], name="unique like"),
        ]

    # def post_creator(self):
    #     return self.post.creator

    def __str__(self):
        return f"Post #{self.post.id} - {self.user} {self.like_unlike_wording}s this"


class Follow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    following = models.ManyToManyField(User, related_name="following")

    class Meta:
        constraints = [
            # Prevent a user from creating multiple Follow lists
            models.UniqueConstraint(fields=['user'], name="unique follow list"),
        ]

    def __str__(self):
        return f"Follow #{self.id} - {self.user}'s follows list"
```

### TDD Models

```

class User(AbstractUser):

    following = models.ManyToManyField('self', related_name='followers', symmetrical=False)

    @property
    def following_count(self):
        return self.following.count()

    @property
    def followers_count(self):
        return User.objects.filter(following=self).count()


class Post(models.Model):
    content = models.CharField(max_length=160)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    pub_date = models.DateTimeField(default=timezone.now)
    likes = models.ManyToManyField(User, related_name='likes')

    @property
    def likes_count(self):
        return self.likes.count()

    @property
    def users_that_like(self):
        return self.likes.all()

    class Meta:
        ordering = ['-pub_date', ]

```
